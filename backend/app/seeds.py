"""Database seed script for development and demonstration data."""

from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models import (
    Brand,
    Category,
    Company,
    Customer,
    FinancialAccount,
    Permission,
    Product,
    Role,
    SaleOrder,
    Supplier,
    User,
)


def run() -> None:
    """Seed the database with initial demo data."""
    session = SessionLocal()
    try:
        if session.scalar(
            select(User).where(User.email == "admin@erp.local")
        ):
            return

        company = Company(
            legal_name="ERP Pequenas Empresas LTDA",
            trade_name="ERP Demo",
            tax_id="00000000000100",
            email="contato@erp.local",
            phone="+55 11 4002-8922",
        )
        session.add(company)
        session.flush()

        permissions = [
            Permission(
                code="admin:*",
                description="Acesso administrativo completo",
            ),
            Permission(
                code="dashboard:read",
                description="Visualizar dashboard executivo",
            ),
            Permission(
                code="users:read",
                description="Listar usuarios",
            ),
        ]
        session.add_all(permissions)
        session.flush()

        role = Role(
            company_id=company.id,
            name="Administrador",
            description="Administrador do ERP",
        )
        role.permissions = permissions
        session.add(role)
        session.flush()

        admin = User(
            company_id=company.id,
            role_id=role.id,
            full_name="Admin",
            email="admin@erp.local",
            password_hash=hash_password("Sapo1010@"),
            job_title="CEO",
            is_active=True,
        )
        category = Category(company_id=company.id, name="Tecnologia")
        brand = Brand(company_id=company.id, name="Acme")
        customer = Customer(
            company_id=company.id,
            name="Cliente Exemplo SA",
            tax_id="11111111000111",
            email="compras@cliente.local",
            phone="+55 11 3000-0000",
            created_at=datetime.now(UTC),
        )
        supplier = Supplier(
            company_id=company.id,
            name="Fornecedor Exemplo",
            tax_id="22222222000122",
            email="vendas@fornecedor.local",
            phone="+55 11 3000-0001",
            created_at=datetime.now(UTC),
        )
        session.add_all([admin, category, brand, customer, supplier])
        session.flush()

        product = Product(
            company_id=company.id,
            category_id=category.id,
            brand_id=brand.id,
            sku="NB-PRO-001",
            name="Notebook Pro",
            description="Notebook corporativo para equipes administrativas.",
            cost_price=Decimal("3200.00"),
            sale_price=Decimal("4990.00"),
            stock_quantity=Decimal("12"),
            minimum_stock=Decimal("3"),
            is_active=True,
            created_at=datetime.now(UTC),
        )
        session.add(product)
        session.flush()

        session.add_all(
            [
                SaleOrder(
                    company_id=company.id,
                    customer_id=customer.id,
                    status="paid",
                    total_amount=Decimal("14970.00"),
                    gross_profit=Decimal("5370.00"),
                    issued_at=datetime.now(UTC),
                ),
                FinancialAccount(
                    company_id=company.id,
                    kind="receivable",
                    description="Venda 0001",
                    amount=Decimal("14970.00"),
                    due_date=date.today() + timedelta(days=7),
                    paid_at=None,
                    created_at=datetime.now(UTC),
                ),
                FinancialAccount(
                    company_id=company.id,
                    kind="payable",
                    description="Fornecedor tecnologia",
                    amount=Decimal("6400.00"),
                    due_date=date.today() - timedelta(days=3),
                    paid_at=None,
                    created_at=datetime.now(UTC),
                ),
            ]
        )
        session.commit()
    finally:
        session.close()


if __name__ == "__main__":
    run()
