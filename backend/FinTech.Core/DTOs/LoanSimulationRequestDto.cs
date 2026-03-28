using FinTech.Core.Enums;

namespace FinTech.Core.DTOs;

public class LoanSimulationRequestDto
{
    public decimal Amount { get; set; }
    public int TermMonths { get; set; }
    public LoanType LoanType { get; set; } = LoanType.Fixed;
    public decimal? InterestRate { get; set; }
}
