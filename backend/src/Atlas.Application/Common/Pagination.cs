using System.Collections.Generic;

namespace Atlas.Application.Common;

public class PaginatedResponse<T>
{
    public int Total { get; set; }
    public IReadOnlyList<T> Items { get; set; } = new List<T>();
    public int Skip { get; set; }
    public int Limit { get; set; }

    public PaginatedResponse() { }

    public PaginatedResponse(IReadOnlyList<T> items, int total, int skip, int limit)
    {
        Items = items;
        Total = total;
        Skip = skip;
        Limit = limit;
    }
}
