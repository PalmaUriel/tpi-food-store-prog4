"""Carga los datos iniciales. Idempotente: se puede ejecutar varias veces sin duplicar.

    python -m app.db.seed

Crea el usuario admin, las categorías y los productos (con stock) del catálogo.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.models import Categoria, Producto, Usuario

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"

CATEGORIAS: list[tuple[str, str]] = [
    ("Pizzas", "Pizzas a la piedra con masa de fermentación lenta"),
    ("Empanadas", "Empanadas al horno, por unidad"),
    ("Hamburguesas", "Hamburguesas de carne smash con papas"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Postres caseros"),
]

# (nombre, descripción, precio, stock, categoría)
PRODUCTOS: list[tuple[str, str, float, int, str]] = [
    ("Pizza Muzzarella", "Salsa de tomate, muzzarella y orégano", 8500, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 9500, 15, "Pizzas"),
    ("Pizza Fugazzeta", "Muzzarella y cebolla caramelizada", 9800, 12, "Pizzas"),
    ("Empanada de carne", "Carne cortada a cuchillo, cebolla y huevo", 1500, 60, "Empanadas"),
    ("Empanada de jamón y queso", "Jamón cocido y muzzarella", 1400, 60, "Empanadas"),
    ("Empanada de humita", "Choclo cremoso y queso", 1400, 40, "Empanadas"),
    ("Hamburguesa clásica", "Doble carne, cheddar, lechuga y tomate", 11000, 25, "Hamburguesas"),
    ("Hamburguesa veggie", "Medallón de lentejas, palta y rúcula", 10500, 10, "Hamburguesas"),
    ("Coca-Cola 1,5 L", "Gaseosa línea regular", 3200, 48, "Bebidas"),
    ("Agua mineral 500 ml", "Sin gas", 1500, 48, "Bebidas"),
    ("Cerveza rubia 473 ml", "Lata", 2800, 36, "Bebidas"),
    ("Flan casero", "Con dulce de leche y crema", 3500, 15, "Postres"),
    ("Tiramisú", "Bizcochos al café y mascarpone", 4500, 8, "Postres"),
]


def _imagen(nombre: str) -> str:
    """Imagen de muestra con el nombre del producto (placehold.co genera la imagen)."""
    return f"https://placehold.co/600x400/f97316/ffffff?text={nombre.replace(' ', '+')}"


def seed_admin(session: Session) -> None:
    """El registro público solo crea "user": el primer admin lo crea el seed."""
    if session.exec(select(Usuario).where(Usuario.username == ADMIN_USERNAME)).first():
        return
    session.add(
        Usuario(
            username=ADMIN_USERNAME,
            full_name="Administrador",
            email="admin@foodstore.com",
            hashed_password=hash_password(ADMIN_PASSWORD),
            role="admin",
        )
    )
    session.commit()
    print(f"  + usuario {ADMIN_USERNAME}")


def seed_categorias(session: Session) -> dict[str, int]:
    """Crea las que falten y devuelve {nombre: id} para asignar los productos."""
    ids: dict[str, int] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()  # para obtener el id
            print(f"  + categoría {nombre}")
        ids[nombre] = categoria.id  # type: ignore[assignment]
    session.commit()
    return ids


def seed_productos(session: Session, categorias: dict[str, int]) -> None:
    for nombre, descripcion, precio, stock, categoria in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first():
            continue
        session.add(
            Producto(
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                stock=stock,
                imagen_url=_imagen(nombre),
                categoria_id=categorias[categoria],
            )
        )
        print(f"  + producto {nombre}")
    session.commit()


def main() -> None:
    create_all_tables()
    with Session(engine) as session:
        print("Cargando datos iniciales...")
        seed_admin(session)
        categorias = seed_categorias(session)
        seed_productos(session, categorias)
    print("Listo.")


if __name__ == "__main__":
    main()