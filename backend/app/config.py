
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str | None = None

    database_username: str | None = None
    database_hostname: str | None = None
    database_name: str | None = None
    database_password: str | None = None
    database_port: str = "5432"

    secret_key: str
    algorithm: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
