from typing import Any, Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones genéricas sobre una tabla.

    Nunca hace commit: eso lo decide el Unit of Work. Tampoco tiene reglas de negocio.
    """

    model: type[T]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, id: Any) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: T) -> T:
        """Inserta o actualiza. El flush envía el SQL sin confirmar: la base asigna el id."""
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        """Borrado físico. En este proyecto casi todo usa baja lógica (activo / disabled)."""
        self.session.delete(obj)
        self.session.flush()