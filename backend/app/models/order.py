from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UuidPkMixin


class SaleOrder(UuidPkMixin, Base):
    """A sales order issued to a customer."""

    __tablename__ = "sale_orders"

    company_id: Mapped[UUID] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True
    )
    customer_id: Mapped[UUID] = mapped_column(ForeignKey("customers.id"))
    status: Mapped[str] = mapped_column(String(30))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    gross_profit: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=0
    )
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class PurchaseOrder(UuidPkMixin, Base):
    """A purchase order issued to a supplier."""

    __tablename__ = "purchase_orders"

    company_id: Mapped[UUID] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True
    )
    supplier_id: Mapped[UUID] = mapped_column(ForeignKey("suppliers.id"))
    status: Mapped[str] = mapped_column(String(30))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
