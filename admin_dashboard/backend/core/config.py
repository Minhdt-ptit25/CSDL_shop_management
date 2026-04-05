from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fashion Store Admin Dashboard API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    # Defaulting to SQLite for easy setup, but can be overridden
    DATABASE_URL: str = "mysql+pymysql://root:12345@localhost:3308/csdl_shop"
    # JWT / auth settings
    SECRET_KEY: str = "change-me-replace-with-secure-random"  # override in env for production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        case_sensitive = True

settings = Settings()
