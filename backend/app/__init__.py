"""Application settings, loaded from environment variables or the .env file."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Holds all configuration values for the app."""

    database_url: str  # required: the app refuses to start without it

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()  # one shared instance, imported wherever it is needed