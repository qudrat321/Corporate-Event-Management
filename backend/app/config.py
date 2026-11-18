"""Read app settings from environment variables or the .env file."""

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Keep the database, login, and API settings."""

    database_url: str
    admin_username: str | None = None
    admin_password: SecretStr | None = None
    jwt_secret_key: SecretStr | None = None
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"]
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()