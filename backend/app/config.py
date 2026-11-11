"""Read app settings from environment variables or the .env file."""

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Keep the settings the app needs."""

    # The address the app uses to connect to its database.
    database_url: str

    # Read setting values from the .env file.
    model_config = SettingsConfigDict(env_file=".env")

# The settings object the app is meant to use.
settings = Settings()