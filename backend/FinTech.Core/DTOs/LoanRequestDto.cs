using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FinTech.Core.Enums;

namespace FinTech.Core.DTOs;

/// <summary>
/// Request body for creating a new loan.
/// </summary>
public class LoanRequestDto
{
    /// <summary>User identifier</summary>
    /// <example>user-001</example>
    [Required]
    public string UserId { get; set; } = string.Empty;

    /// <summary>Loan amount (min: 500, max: 50000)</summary>
    /// <example>5000</example>
    [Range(500, 50000)]
    public decimal Amount { get; set; }

    /// <summary>Term in months (min: 6, max: 60)</summary>
    /// <example>12</example>
    [Range(6, 60)]
    public int TermMonths { get; set; }

    /// <summary>Loan type: Fixed or Decreasing</summary>
    /// <example>Fixed</example>
    [DefaultValue(LoanType.Fixed)]
    public LoanType LoanType { get; set; } = LoanType.Fixed;

    /// <summary>Applicant's monthly income (must be greater than 0)</summary>
    /// <example>3000</example>
    [Range(1, double.MaxValue)]
    public decimal MonthlyIncome { get; set; }

    /// <summary>Optional annual interest rate (TEA). Defaults to 0.24 if not provided. Range: 0.18 - 0.35</summary>
    /// <example>0.24</example>
    public decimal? InterestRate { get; set; }
}
