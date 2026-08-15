using System;

namespace Atlas.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public interface ISoftDelete
{
    bool IsDeleted { get; }
    DateTime? DeletedAt { get; set; }
}

public interface ITenantEntity
{
    Guid CompanyId { get; set; }
}
