from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    """Entrada del registro público. El rol no se recibe: siempre es "user"."""

    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # 72 = límite de bcrypt


class UserPublic(SQLModel):
    """Salida: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime