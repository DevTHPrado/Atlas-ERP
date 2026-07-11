from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UuidPkMixin


class Company(UuidPkMixin, TimestampMixin, Base):
    """Tenant entity representing a business organization."""

    __tablename__ = "companies"

    legal_name: Mapped[str] = mapped_column(String(180))
    trade_name: Mapped[str] = mapped_column(String(120))
    tax_id: Mapped[str] = mapped_column(String(32), unique=True)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(32))
