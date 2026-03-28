using FinTech.Core.Utils;

namespace FinTech.Core.DTOs;

public class LoanSimulationResponseDto
{
    public decimal MonthlyPayment { get; set; }
    public decimal TotalInterest { get; set; }
    public decimal TotalPayment { get; set; }
    public decimal TEM { get; set; }
    public decimal TEA { get; set; }
    public List<PaymentScheduleItem> Schedule { get; set; } = new();
}
