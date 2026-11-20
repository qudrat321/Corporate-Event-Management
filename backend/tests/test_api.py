import os
import unittest
from datetime import date
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite://")

from app import main
from app.config import settings
from app.db import Base, get_db
from app.models import Event


class EventApiIntegrationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.engine = create_async_engine("sqlite+aiosqlite://")
        self.session_factory = async_sessionmaker(self.engine, expire_on_commit=False)
        async with self.engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)

        self.settings_patches = [
            patch.object(settings, "admin_username", "admin"),
            patch.object(settings, "admin_password", SecretStr("secure-test-password")),
            patch.object(
                settings,
                "jwt_secret_key",
                SecretStr("test-secret-key-with-at-least-32-bytes"),
            ),
            patch.object(settings, "access_token_expire_minutes", 60),
        ]
        for setting_patch in self.settings_patches:
            setting_patch.start()

        self.previous_overrides = main.app.dependency_overrides.copy()

        async def override_get_db():
            async with self.session_factory() as session:
                yield session

        main.app.dependency_overrides[get_db] = override_get_db
        self.client = AsyncClient(
            transport=ASGITransport(app=main.app),
            base_url="http://test",
        )

    async def asyncTearDown(self):
        await self.client.aclose()
        main.app.dependency_overrides.clear()
        main.app.dependency_overrides.update(self.previous_overrides)
        for setting_patch in reversed(self.settings_patches):
            setting_patch.stop()
        await self.engine.dispose()

    async def administrator_headers(self):
        response = await self.client.post(
            "/auth/login",
            json={"username": "admin", "password": "secure-test-password"},
        )
        self.assertEqual(response.status_code, 200)
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    async def test_root_cors_login_and_protected_event_management(self):
        root = await self.client.get("/")
        self.assertEqual(root.status_code, 200)
        self.assertEqual(root.json()["docs"], "/docs")

        preflight = await self.client.options(
            "/events",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        self.assertEqual(preflight.status_code, 200)
        self.assertEqual(
            preflight.headers["access-control-allow-origin"],
            "http://localhost:5173",
        )

        invalid_login = await self.client.post(
            "/auth/login",
            json={"username": "admin", "password": "incorrect-password"},
        )
        self.assertEqual(invalid_login.status_code, 401)

        event_data = {
            "title": "Team retreat",
            "description": "A team day.",
            "event_date": "2026-12-01",
            "location": "Main office",
            "max_capacity": 2,
        }
        unauthorized = await self.client.post("/events", json=event_data)
        self.assertEqual(unauthorized.status_code, 401)

        headers = await self.administrator_headers()
        created = await self.client.post("/events", json=event_data, headers=headers)
        self.assertEqual(created.status_code, 201)
        event_id = created.json()["id"]

        search = await self.client.get(
            "/events",
            params={"skip": 0, "limit": 10, "title": "retreat", "date": "2026-12-01"},
        )
        self.assertEqual(search.status_code, 200)
        self.assertEqual(search.json()["total"], 1)
        self.assertEqual(search.json()["items"][0]["id"], event_id)
        self.assertEqual((await self.client.get(f"/events/{event_id}")).status_code, 200)

        updated_data = {**event_data, "title": "Updated retreat"}
        updated = await self.client.put(
            f"/events/{event_id}",
            json=updated_data,
            headers=headers,
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["title"], "Updated retreat")

    async def test_event_list_uses_ten_item_pages(self):
        async with self.session_factory() as session:
            session.add_all(
                [
                    Event(
                        title=f"Pagination event {index:02d}",
                        event_date=date(2026, 12, index),
                        location="Online",
                        max_capacity=20,
                    )
                    for index in range(1, 16)
                ]
            )
            await session.commit()

        first_page = await self.client.get("/events", params={"skip": 0, "limit": 10})
        second_page = await self.client.get("/events", params={"skip": 10, "limit": 10})
        self.assertEqual(first_page.status_code, 200)
        self.assertEqual(second_page.status_code, 200)
        self.assertEqual(first_page.json()["total"], 15)
        self.assertEqual(len(first_page.json()["items"]), 10)
        self.assertEqual(len(second_page.json()["items"]), 5)
        oversized_page = await self.client.get("/events", params={"limit": 101})
        self.assertEqual(oversized_page.status_code, 422)
        large_page = await self.client.get("/events", params={"skip": 0, "limit": 100})
        self.assertEqual(large_page.status_code, 200)
        self.assertEqual(len(large_page.json()["items"]), 15)

    async def test_registration_conflicts_capacity_and_cancellation(self):
        headers = await self.administrator_headers()
        created = await self.client.post(
            "/events",
            json={
                "title": "Registration test",
                "description": None,
                "event_date": "2026-12-02",
                "location": "Online",
                "max_capacity": 2,
            },
            headers=headers,
        )
        event_id = created.json()["id"]

        first = await self.client.post(
            f"/events/{event_id}/registrations",
            json={"employee_name": "Alex One", "employee_email": "Alex@Example.com"},
        )
        self.assertEqual(first.status_code, 201)
        self.assertEqual(first.json()["employee_email"], "alex@example.com")

        duplicate = await self.client.post(
            f"/events/{event_id}/registrations",
            json={"employee_name": "Alex One", "employee_email": "alex@example.com"},
        )
        self.assertEqual(duplicate.status_code, 409)

        second = await self.client.post(
            f"/events/{event_id}/registrations",
            json={"employee_name": "Sam Two", "employee_email": "sam@example.com"},
        )
        self.assertEqual(second.status_code, 201)

        full = await self.client.post(
            f"/events/{event_id}/registrations",
            json={"employee_name": "Pat Three", "employee_email": "pat@example.com"},
        )
        self.assertEqual(full.status_code, 409)

        attendees = await self.client.get(f"/events/{event_id}/registrations")
        self.assertEqual(len(attendees.json()), 2)

        lower_capacity = await self.client.put(
            f"/events/{event_id}",
            json={
                "title": "Registration test",
                "description": None,
                "event_date": "2026-12-02",
                "location": "Online",
                "max_capacity": 1,
            },
            headers=headers,
        )
        self.assertEqual(lower_capacity.status_code, 409)

        registration_id = first.json()["id"]
        unauthenticated_cancel = await self.client.delete(
            f"/registrations/{registration_id}"
        )
        self.assertEqual(unauthenticated_cancel.status_code, 401)
        cancelled = await self.client.delete(
            f"/registrations/{registration_id}",
            headers=headers,
        )
        self.assertEqual(cancelled.status_code, 204)

        event_deleted = await self.client.delete(f"/events/{event_id}", headers=headers)
        self.assertEqual(event_deleted.status_code, 204)
        missing_registrations = await self.client.get(
            f"/events/{event_id}/registrations"
        )
        self.assertEqual(missing_registrations.status_code, 404)


if __name__ == "__main__":
    unittest.main()
