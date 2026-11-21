from datetime import datetime, timezone


def ahora() -> datetime:
    """Fecha y hora actual en UTC (created_at, updated_at)."""
    return datetime.now(timezone.utc)