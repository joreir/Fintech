// FinTech.Core/Utils/FinancialCalculator.cs
namespace FinTech.Core.Utils;

public static class FinancialCalculator
{
    /// <summary>
    /// TEM = (1 + TEA)^(1/12) - 1
    /// </summary>
    public static decimal CalculateTEM(decimal tea)
    {
        return (decimal)(Math.Pow((double)(1 + tea), 1.0 / 12) - 1);
    }

    /// <summary>
    /// Cuota = Monto * [TEM * (1+TEM)^n] / [(1+TEM)^n - 1]
    /// </summary>
    public static decimal CalculateFixedPayment(decimal amount, decimal tem, int months)
    {
        double r = (double)tem;
        double n = months;
        double factor = Math.Pow(1 + r, n);
        return (decimal)(((double)amount * r * factor) / (factor - 1));
    }

    /// <summary>
    /// </summary>
    public static List<PaymentScheduleItem> GenerateSchedule(
        decimal amount,
        decimal tem,
        int months,
        DateTime startDate)
    {
        var schedule = new List<PaymentScheduleItem>();
        decimal fixedPayment = CalculateFixedPayment(amount, tem, months);
        decimal balance = amount;

        for (int i = 1; i <= months; i++)
        {
            decimal interest = Math.Round(balance * tem, 2);
            decimal principal = Math.Round(fixedPayment - interest, 2);
            
            if (i == months)
            {
                principal = balance;
                fixedPayment = principal + interest;
            }

            balance = Math.Round(balance - principal, 2);

            schedule.Add(new PaymentScheduleItem
            {
                PaymentNumber = i,
                DueDate = GetPaymentDate(startDate, i),
                TotalPayment = Math.Round(principal + interest, 2),
                Principal = principal,
                Interest = interest,
                RemainingBalance = balance
            });
        }

        return schedule;
    }

    /// <summary>
    /// </summary>
    private static DateTime GetPaymentDate(DateTime startDate, int monthNumber)
    {
        int targetMonth = startDate.Month + monthNumber;
        int year = startDate.Year + (targetMonth - 1) / 12;
        int month = ((targetMonth - 1) % 12) + 1;
        int day = Math.Min(startDate.Day, DateTime.DaysInMonth(year, month));

        return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
    }
}

public record PaymentScheduleItem
{
    public int PaymentNumber { get; init; }
    public DateTime DueDate { get; init; }
    public decimal TotalPayment { get; init; }
    public decimal Principal { get; init; }
    public decimal Interest { get; init; }
    public decimal RemainingBalance { get; init; }
}