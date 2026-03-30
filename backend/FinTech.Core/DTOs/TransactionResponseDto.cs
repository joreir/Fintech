using FinTech.Core.Enums;

namespace FinTech.Core.DTOs;

public class TransactionResponseDto
{
    public Guid Id { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public TransactionStatus Status { get; set; }
    public Guid? LoanId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
