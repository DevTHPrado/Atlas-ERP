from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.dependencies.auth import CurrentUser, require_permission
from app.models.customer import Customer
from app.models.financial import FinancialAccount
from app.models.order import SaleOrder
from app.models.product import Product
from app.schemas.dashboard import ChartPoint, DashboardKpis, DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard Executivo"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(require_permission("dashboard:read")),
) -> DashboardResponse:
    """Return executive dashboard with KPIs and chart data."""
    today = date.today()
    next_30_days = today + timedelta(days=30)

    revenue = session.scalar(
        select(func.coalesce(func.sum(SaleOrder.total_amount), 0)).where(
            SaleOrder.company_id == current_user.company_id,
            SaleOrder.status.in_(["confirmed", "paid"]),
        )
    )
    profit = session.scalar(
        select(func.coalesce(func.sum(SaleOrder.gross_profit), 0)).where(
            SaleOrder.company_id == current_user.company_id,
            SaleOrder.status.in_(["confirmed", "paid"]),
        )
    )
    active_customers = session.scalar(
        select(func.count(Customer.id)).where(
            Customer.company_id == current_user.company_id,
            Customer.is_active.is_(True),
        )
    )
    overdue = session.scalar(
        select(func.coalesce(func.sum(FinancialAccount.amount), 0)).where(
            FinancialAccount.company_id == current_user.company_id,
            FinancialAccount.kind == "payable",
            FinancialAccount.paid_at.is_(None),
            FinancialAccount.due_date < today,
        )
    )
    upcoming = session.scalar(
        select(func.coalesce(func.sum(FinancialAccount.amount), 0)).where(
            FinancialAccount.company_id == current_user.company_id,
            FinancialAccount.kind == "payable",
            FinancialAccount.paid_at.is_(None),
            FinancialAccount.due_date.between(today, next_30_days),
        )
    )
    out_of_stock = session.scalar(
        select(func.count(Product.id)).where(
            Product.company_id == current_user.company_id,
            Product.stock_quantity <= Product.minimum_stock,
        )
    )
    cash_rows = session.execute(
        select(
            FinancialAccount.due_date,
            func.sum(
                case(
                    (
                        FinancialAccount.kind == "receivable",
                        FinancialAccount.amount,
                    ),
                    else_=-FinancialAccount.amount,
                )
            ),
        )
        .where(FinancialAccount.company_id == current_user.company_id)
        .group_by(FinancialAccount.due_date)
        .order_by(FinancialAccount.due_date)
        .limit(12)
    ).all()

    return DashboardResponse(
        kpis=DashboardKpis(
            revenue=revenue or Decimal("0"),
            profit=profit or Decimal("0"),
            active_customers=active_customers or 0,
            overdue_accounts=overdue or Decimal("0"),
            upcoming_accounts=upcoming or Decimal("0"),
            out_of_stock_products=out_of_stock or 0,
        ),
        cash_flow=[
            ChartPoint(label=row[0].isoformat(), value=row[1])
            for row in cash_rows
        ],
        top_products=[
            ChartPoint(label="Notebook Pro", value=Decimal("42")),
            ChartPoint(label="Monitor 27", value=Decimal("35")),
            ChartPoint(label="Licenca SaaS", value=Decimal("28")),
        ],
    )
