using FinTech.Core.Common;
using FinTech.Core.Enums;

namespace FinTech.Core.Entities;

public class Transaction : BaseEntity<Guid>
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public TransactionStatus Status { get; set; }
    public Guid? LoanId { get; set; }
    public Loan? Loan { get; set; }
    public string Description { get; set; } = string.Empty;
}
