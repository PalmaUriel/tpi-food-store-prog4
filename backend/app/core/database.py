from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def create_all_tables() -> None:
    """Crea las tablas que todavía no existen (no modifica las existentes)."""
    import app.models  

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea una sesión nueva. La usan el Unit of Work y get_session."""
    return Session(engine)


def get_session() -> Generator[Session, None, None]:
    """Sesión por petición para las dependencias de FastAPI (lectura de la sesión del usuario)."""
    with session_factory() as session:
        yield session