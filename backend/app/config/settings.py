from functools import lru_cache

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "ERP Pequenas Empresas"
    app_env: str = "local"
    app_debug: bool = False
    api_v1_prefix: str = "/api/v1"
    secret_key: str = Field(default="local-development-secret-key", min_length=16)
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    database_url: str = "postgresql+psycopg://erp:erp@localhost:5432/erp"
    redis_url: str = "redis://localhost:6379/0"
    backend_cors_origins: list[AnyHttpUrl] | str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    @property
    def cors_origins(self) -> list[str]:
        if isinstance(self.backend_cors_origins, str):
            return [
                origin.strip()
                for origin in self.backend_cors_origins.split(",")
                if origin.strip()
            ]
        return [str(origin) for origin in self.backend_cors_origins]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
