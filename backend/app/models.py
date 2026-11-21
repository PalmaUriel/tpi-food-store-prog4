"""Importa todos los modelos de tabla para que SQLModel los registre.

Lo usan create_all_tables() y el seed. Si falta uno acá, su tabla no se crea
y las relaciones que lo nombran fallan al iniciar.
"""

from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

__all__ = ["Categoria", "DetallePedido", "Pedido", "Producto", "Usuario"]