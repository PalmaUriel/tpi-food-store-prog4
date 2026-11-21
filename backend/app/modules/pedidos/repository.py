from datetime import datetime

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self,
        *,
        skip: int,
        limit: int,
        usuario_id: int | None = None,
        estado: str | None = None,
    ) -> tuple[list[Pedido], int]:
        """usuario_id=None -> todos (admin). Más recientes primero. Devuelve (página, total)."""
        consulta = select(Pedido)
        if usuario_id is not None:
            consulta = consulta.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            consulta = consulta.where(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(consulta.subquery())).one()
        items = self.session.exec(
            consulta.order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return list(items), total

    def count_by_estado(self) -> dict[str, int]:
        """{"PENDIENTE": 3, "ENTREGADO": 5, ...} con un solo GROUP BY."""
        filas = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        total = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        ).one()
        return float(total)