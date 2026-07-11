from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UuidPkMixin


class Category(UuidPkMixin, Base):
    """A product category within a company."""

    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint(
            "company_id", "name", name="uq_categories_company_name"
        ),
    )

    company_id: Mapped[UUID] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(120))


class Brand(UuidPkMixin, Base):
    """A product brand within a company."""

    __tablename__ = "brands"
    __table_args__ = (
        UniqueConstraint("company_id", "name", name="uq_brands_company_name"),
    )

    company_id: Mapped[UUID] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(120))


class Product(UuidPkMixin, Base):
    """A product in the company's catalog."""

    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint(
            "company_id", "sku", name="uq_products_company_sku"
        ),
    )

    company_id: Mapped[UUID] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True
    )
    category_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("categories.id")
    )
    brand_id: Mapped[UUID | None] = mapped_column(ForeignKey("brands.id"))
    sku: Mapped[str] = mapped_column(String(80))
    name: Mapped[str] = mapped_column(String(180))
    description: Mapped[str | None] = mapped_column(Text)
    cost_price: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    sale_price: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    stock_quantity: Mapped[Decimal] = mapped_column(
        Numeric(14, 3), default=0
    )
    minimum_stock: Mapped[Decimal] = mapped_column(Numeric(14, 3), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class StockMovement(UuidPkMixin, Base):
    """A record of inventory movement for a product."""

    __tablename__ = "stock_movements"

    company_id: Mapped[UUID] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True
    )
    product_id: Mapped[UUID] = mapped_column(ForeignKey("products.id"))
    movement_type: Mapped[str] = mapped_column(String(20))
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 3))
    unit_cost: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    reason: Mapped[str] = mapped_column(String(180))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
