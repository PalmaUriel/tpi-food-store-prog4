from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import ahora

if TYPE_CHECKING:  
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=120)
    email: str = Field(max_length=120, unique=True, index=True)
    hashed_password: str = Field(max_length=255)
    role: str = Field(default="user", max_length=10)  # "user" | "admin"
    disabled: bool = Field(default=False)  # baja lógica: el admin activa / desactiva
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))

    # Usuario 1:N Pedido
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")