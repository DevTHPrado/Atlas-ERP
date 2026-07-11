from decimal import Decimal

from pydantic import BaseModel


class DashboardKpis(BaseModel):
    """Key performance indicators for the executive dashboard."""

    revenue: Decimal
    profit: Decimal
    active_customers: int
    overdue_accounts: Decimal
    upcoming_accounts: Decimal
    out_of_stock_products: int


class ChartPoint(BaseModel):
    """A single data point for chart visualization."""

    label: str
    value: Decimal


class DashboardResponse(BaseModel):
    """Complete dashboard response with KPIs and chart data."""

    kpis: DashboardKpis
    cash_flow: list[ChartPoint]
    top_products: list[ChartPoint]
