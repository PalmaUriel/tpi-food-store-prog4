from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


# ---------- Excepciones de dominio (el Router las traduce a HTTP) ----------

class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


# ---------- Casos de uso ----------

class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._obtener_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre = data.nombre.strip()
            if uow.categorias.get_by_nombre(nombre) is not None:
                raise NombreDuplicado(nombre)
            categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "nombre" in cambios:
                cambios["nombre"] = cambios["nombre"].strip()
                otra = uow.categorias.get_by_nombre(cambios["nombre"])
                if otra is not None and otra.id != categoria.id:
                    raise NombreDuplicado(cambios["nombre"])
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica. No oculta sus productos: para retirarlos se dan de baja aparte."""
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _obtener_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        """Una categoría dada de baja se trata como inexistente (404)."""
        categoria = uow.categorias.get_activa(categoria_id)
        if categoria is None:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria