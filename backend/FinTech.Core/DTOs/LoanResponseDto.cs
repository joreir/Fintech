using FinTech.Core.Enums;
using FinTech.Core.Utils;

namespace FinTech.Core.DTOs;

public class LoanResponseDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int Term { get; set; }
    public decimal InterestRate { get; set; }
    public LoanType LoanType { get; set; }
    public LoanStatus Status { get; set; }
    public decimal MonthlyPayment { get; set; }
    public decimal MonthlyIncome { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PaymentScheduleItemDto> PaymentSchedules { get; set; } = new();
}

public class PaymentScheduleItemDto
{
    public int PaymentNumber { get; set; }
    public DateTime DueDate { get; set; }
    public decimal TotalPayment { get; set; }
    public decimal Principal { get; set; }
    public decimal Interest { get; set; }
    public decimal RemainingBalance { get; set; }
    public PaymentStatus Status { get; set; }
}
