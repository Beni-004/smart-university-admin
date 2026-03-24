"""Application settings loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    GROQ_API_KEY: str | None = None
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "sqlcoder:15b"
    CACHE_SIZE: int = 100
    QUERY_TIMEOUT: int = 120
    DB_POOL_MIN: int = 1
    DB_POOL_MAX: int = 10

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


config = Settings()
