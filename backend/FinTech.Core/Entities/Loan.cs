using FinTech.Core.Common;
using FinTech.Core.Enums;

namespace FinTech.Core.Entities;

public class Loan : BaseEntity<Guid>
{
    public string UserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int Term { get; set; } 
    public decimal InterestRate { get; set; } 
    public LoanType LoanType { get; set; }
    public LoanStatus Status { get; set; }
    public decimal MonthlyPayment { get; set; }
}
