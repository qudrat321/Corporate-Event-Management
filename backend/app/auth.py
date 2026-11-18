"""Create and validate bearer tokens for the configured event administrator."""
from datetime import datetime, timedelta, timezone
import hmac

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def auth_configuration() -> tuple[str, str, str]:
    """Return configured login values or report that administrator login is unavailable."""
    if (
        not settings.admin_username
        or settings.admin_password is None
        or settings.jwt_secret_key is None
        or settings.access_token_expire_minutes < 1
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Administrator login is not configured on the backend.",
        )

    password = settings.admin_password.get_secret_value()
    secret_key = settings.jwt_secret_key.get_secret_value()
    if len(password) < 12 or len(secret_key.encode("utf-8")) < 32:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Administrator login settings do not meet the minimum security requirements.",
        )

    return settings.admin_username, password, secret_key


def credentials_match(username: str, password: str) -> bool:
    """Compare configured login values using constant-time byte comparisons."""
    configured_username, configured_password, _ = auth_configuration()
    username_matches = hmac.compare_digest(
        username.encode("utf-8"), configured_username.encode("utf-8")
    )
    password_matches = hmac.compare_digest(
        password.encode("utf-8"), configured_password.encode("utf-8")
    )
    return username_matches and password_matches


def create_access_token(username: str) -> str:
    """Sign an expiring access token for the administrator."""
    _, _, secret_key = auth_configuration()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": username, "exp": expires_at},
        secret_key,
        algorithm="HS256",
    )


async def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """Reject requests without a valid administrator access token."""
    username, _, secret_key = auth_configuration()
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sign in is required to manage events.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise credentials_error
    try:
        payload = jwt.decode(credentials.credentials, secret_key, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise credentials_error from None

    token_username = payload.get("sub")
    if not isinstance(token_username, str) or not hmac.compare_digest(
        token_username.encode("utf-8"), username.encode("utf-8")
    ):
        raise credentials_error
    return token_username
