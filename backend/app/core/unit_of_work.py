from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Agrupa las operaciones de un caso de uso en UNA transacción.

    with uow:          -> __enter__: abre la sesión
        ...            -> los repositorios trabajan (flush, sin commit)
    (salida normal)    -> __exit__: commit, se guarda todo
    (excepción)        -> __exit__: rollback, no se guarda nada
    En los dos casos la sesión se cierra.
    """

    session: Session

    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()