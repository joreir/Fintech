using FinTech.Core.Enums;

namespace FinTech.Core.DTOs;

public class LoanRequestDto
{
    public string UserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int TermMonths { get; set; }
    public LoanType LoanType { get; set; } = LoanType.Fixed;
    public decimal MonthlyIncome { get; set; }
    public decimal? InterestRate { get; set; }
}
