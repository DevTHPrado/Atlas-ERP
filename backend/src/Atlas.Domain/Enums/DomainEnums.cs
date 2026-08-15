namespace Atlas.Domain.Enums;

public enum PersonType
{
    PJ,
    PF
}

public enum MovementType
{
    In,
    Out,
    Transfer,
    Adjustment
}

public enum StockMovementReason
{
    Purchase,
    Sale,
    Return,
    Damage,
    Loss,
    InventoryAdjustment,
    Transfer,
    Other
}

public enum AdjustmentStatus
{
    Draft,
    Applied,
    Cancelled
}

public enum FinancialAccountKind
{
    Receivable,
    Payable
}

public enum SaleOrderStatus
{
    Draft,
    Pending,
    Confirmed,
    Paid,
    Cancelled
}
