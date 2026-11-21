from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración leída del archivo .env (o de variables de entorno).

    Si falta una variable obligatoria o no cumple la validación, la aplicación
    no arranca y pydantic indica cuál es el problema.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, gt=0)
    FRONTEND_ORIGIN: str = "http://localhost:5173"


settings = Settings() 