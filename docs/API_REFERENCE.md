# Acme Corp Event Management — API Reference

> **Base URL (dev):** `http://127.0.0.1:8000`
> **Auth:** `Authorization: Bearer <token>` (admin endpoints only)
> **Content-Type:** `application/json`

---

## Authentication

### Get a Token

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "YOUR_ADMIN_PASSWORD"}'
```

**Response**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

Save the `access_token`. Pass it in subsequent admin requests as:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Health

### GET /health — Check API & DB status

```bash
curl http://127.0.0.1:8000/health
```

**200 OK**
```json
{ "status": "ok" }
```

---

## Events

### GET /events — List events (paginated)

```bash
# Default (first 10 events)
curl "http://127.0.0.1:8000/events"

# With pagination
curl "http://127.0.0.1:8000/events?skip=10&limit=5"

# Filter by title
curl "http://127.0.0.1:8000/events?title=kickoff"

# Filter by date
curl "http://127.0.0.1:8000/events?date=2026-03-15"
```

**200 OK**
```json
[
  {
    "id": 1,
    "title": "Annual Company Kickoff",
    "description": "New year planning and strategy session",
    "event_date": "2026-01-15",
    "location": "Main Auditorium",
    "max_capacity": 200
  },
  {
    "id": 2,
    "title": "Team Building Workshop",
    "description": null,
    "event_date": "2026-03-20",
    "location": "Conference Room A",
    "max_capacity": 50
  }
]
```

---

### POST /events — Create an event (Admin)

```bash
curl -X POST http://127.0.0.1:8000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Q2 All Hands",
    "description": "Quarterly company update",
    "event_date": "2026-04-10",
    "location": "HQ Auditorium",
    "max_capacity": 300
  }'
```

**201 Created**
```json
{
  "id": 16,
  "title": "Q2 All Hands",
  "description": "Quarterly company update",
  "event_date": "2026-04-10",
  "location": "HQ Auditorium",
  "max_capacity": 300
}
```

**Error — 401 Unauthorized**
```json
{ "detail": "Not authenticated" }
```

**Error — 422 Validation Error**
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

### GET /events/{id} — Get single event

```bash
curl http://127.0.0.1:8000/events/1
```

**200 OK**
```json
{
  "id": 1,
  "title": "Annual Company Kickoff",
  "description": "New year planning and strategy session",
  "event_date": "2026-01-15",
  "location": "Main Auditorium",
  "max_capacity": 200
}
```

**Error — 404 Not Found**
```json
{ "detail": "Event not found" }
```

---

### PUT /events/{id} — Update event (Admin)

```bash
curl -X PUT http://127.0.0.1:8000/events/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Annual Company Kickoff 2026",
    "description": "Updated description",
    "event_date": "2026-01-16",
    "location": "Main Auditorium (Floor 2)",
    "max_capacity": 250
  }'
```

**200 OK** — Returns updated event object.

---

### DELETE /events/{id} — Delete event (Admin)

```bash
curl -X DELETE http://127.0.0.1:8000/events/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**200 OK**
```json
{ "message": "Event deleted" }
```

> **Note:** Deleting an event also deletes all its registrations (cascade delete).

---

## Registrations

### GET /events/{id}/registrations — List attendees

```bash
curl http://127.0.0.1:8000/events/1/registrations
```

**200 OK**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "employee_name": "Jane Smith",
    "employee_email": "jane.smith@acmecorp.com"
  },
  {
    "id": 2,
    "event_id": 1,
    "employee_name": "John Doe",
    "employee_email": "john.doe@acmecorp.com"
  }
]
```

---

### POST /events/{id}/registrations — Register for event

```bash
curl -X POST http://127.0.0.1:8000/events/1/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "employee_name": "Alice Johnson",
    "employee_email": "alice.johnson@acmecorp.com"
  }'
```

**201 Created**
```json
{
  "id": 42,
  "event_id": 1,
  "employee_name": "Alice Johnson",
  "employee_email": "alice.johnson@acmecorp.com"
}
```

**Error — 400 Event Full**
```json
{ "detail": "Event is at full capacity" }
```

**Error — 400 Duplicate Registration**
```json
{ "detail": "This email is already registered for this event" }
```

**Error — 404 Event Not Found**
```json
{ "detail": "Event not found" }
```

---

### DELETE /registrations/{id} — Cancel registration (Admin)

```bash
curl -X DELETE http://127.0.0.1:8000/registrations/42 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**200 OK**
```json
{ "message": "Registration cancelled" }
```

**Error — 404 Not Found**
```json
{ "detail": "Registration not found" }
```

---

## Error Code Summary

| HTTP Status | Meaning | Common Causes |
|-------------|---------|--------------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Business rule violation (capacity full, duplicate email) |
| `401` | Unauthorized | Missing, expired, or invalid JWT token |
| `404` | Not Found | Event or registration ID does not exist |
| `422` | Unprocessable Entity | Request body fails Pydantic validation |
| `500` | Internal Server Error | Unexpected server error (check backend logs) |

---

## Interactive Docs

FastAPI provides two built-in interactive API explorers:

| URL | Interface |
|-----|-----------|
| `http://127.0.0.1:8000/docs` | Swagger UI — try endpoints directly in browser |
| `http://127.0.0.1:8000/redoc` | ReDoc — clean, readable reference |
