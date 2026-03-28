using FinTech.Core.Utils;
namespace FinTech.Tests.Unit;

public class FinancialCalculatorTests
{
    [Fact]
    public void CalculateFixedPayment_ShouldReturnCorrectPayment()
    {
        // $10,000 a 12 meses con TEA 24% → cuota ≈ $943
        decimal amount = 10000;
        int months = 12;
        decimal tem = FinancialCalculator.CalculateTEM(0.24m);

        decimal result = FinancialCalculator.CalculateFixedPayment(amount, tem, months);

        Assert.InRange(result, 933m, 936m);
    }
    
    [Fact]
    public void GenerateSchedule_ShouldHaveCorrectNumberOfPayments()
    {
        decimal tem = FinancialCalculator.CalculateTEM(0.24m);
        var schedule = FinancialCalculator.GenerateSchedule(10000, tem, 12, DateTime.Today);

        Assert.Equal(12, schedule.Count);
    }

    [Fact]
    public void GenerateSchedule_LastPaymentShouldHaveZeroBalance()
    {
        decimal tem = FinancialCalculator.CalculateTEM(0.24m);
        var schedule = FinancialCalculator.GenerateSchedule(10000, tem, 12, DateTime.Today);

        Assert.Equal(0, schedule.Last().RemainingBalance);
    }
    
    [Fact]
    public void CalculateTEM_WithTEA24_ShouldReturnCorrectRate()
    {
        decimal result = FinancialCalculator.CalculateTEM(0.24m);

        // TEM de 24% TEA ≈ 1.8%
        Assert.InRange(result, 0.017m, 0.019m);
    }
    
    [Fact]
    public void GenerateSchedule_SumOfPrincipalsShouldEqualLoanAmount()
    {
        decimal amount = 10000;
        decimal tem = FinancialCalculator.CalculateTEM(0.24m);
        var schedule = FinancialCalculator.GenerateSchedule(amount, tem, 12, DateTime.Today);

        decimal totalPrincipal = schedule.Sum(s => s.Principal);

        Assert.Equal(amount, totalPrincipal);
    }
}