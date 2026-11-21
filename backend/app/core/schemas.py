from typing import Generic, TypeVar

from sqlmodel import SQLModel

T = TypeVar("T")


class Paginado(SQLModel, Generic[T]):
    """Forma común de los listados paginados: { "total": N, "items": [...] }."""

    total: int
    items: list[T]


class Mensaje(SQLModel):
    """Respuesta simple, por ejemplo la del login y la del logout."""

    message: str