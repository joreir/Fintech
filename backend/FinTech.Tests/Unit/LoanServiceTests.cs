using FinTech.Core.DTOs;
using FinTech.Core.Entities;
using FinTech.Core.Enums;
using FinTech.Core.Interfaces;
using FinTech.Core.Services;
using Moq;

namespace FinTech.Tests.Unit;

public class LoanServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ILoanRepository> _mockLoanRepo;
    private readonly Mock<ITransactionService> _mockTransactionService;
    private readonly LoanService _service;

    public LoanServiceTests()
    {
        _mockLoanRepo = new Mock<ILoanRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockTransactionService = new Mock<ITransactionService>();
        _mockUnitOfWork.Setup(u => u.Loans).Returns(_mockLoanRepo.Object);
        _mockUnitOfWork.Setup(u => u.CommitAsync()).ReturnsAsync(1);
        _service = new LoanService(_mockUnitOfWork.Object, _mockTransactionService.Object);
    }

    [Fact]
    public async Task SimulateLoan_ValidRequest_ShouldReturnSchedule()
    {
        var request = new LoanSimulationRequestDto { Amount = 10_000m, TermMonths = 12 };

        var result = await _service.SimulateLoanAsync(request);

        Assert.True(result.Success);
        Assert.Equal(12, result.Data!.Schedule.Count);
        Assert.True(result.Data.MonthlyPayment > 0);
    }

    [Fact]
    public async Task SimulateLoan_InvalidAmount_ShouldFail()
    {
        var result = await _service.SimulateLoanAsync(new LoanSimulationRequestDto { Amount = 100m, TermMonths = 12 });
        Assert.False(result.Success);

        result = await _service.SimulateLoanAsync(new LoanSimulationRequestDto { Amount = 60_000m, TermMonths = 12 });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task RequestLoan_MaxActiveLoansReached_ShouldFail()
    {
        _mockLoanRepo.Setup(r => r.GetActiveLoansCountAsync("user1")).ReturnsAsync(3);

        var request = new LoanRequestDto
        {
            UserId = "user1", Amount = 5000m, TermMonths = 12, MonthlyIncome = 5000m
        };

        var result = await _service.RequestLoanAsync(request);

        Assert.False(result.Success);
        Assert.Contains("3", result.ErrorMessage!);
    }

    [Fact]
    public async Task RequestLoan_DebtExceeds40PercentOfIncome_ShouldFail()
    {
        _mockLoanRepo.Setup(r => r.GetActiveLoansCountAsync("user1")).ReturnsAsync(0);
        _mockLoanRepo.Setup(r => r.GetTotalMonthlyPaymentsAsync("user1")).ReturnsAsync(1500m);

        var request = new LoanRequestDto
        {
            UserId = "user1", Amount = 40_000m, TermMonths = 60, MonthlyIncome = 3000m
        };

        var result = await _service.RequestLoanAsync(request);

        Assert.False(result.Success);
        Assert.Contains("40%", result.ErrorMessage!);
    }

    [Fact]
    public async Task RequestLoan_SmallAmountFewLoans_ShouldAutoApprove()
    {
        _mockLoanRepo.Setup(r => r.GetActiveLoansCountAsync("user1")).ReturnsAsync(1);
        _mockLoanRepo.Setup(r => r.GetTotalMonthlyPaymentsAsync("user1")).ReturnsAsync(0m);
        _mockLoanRepo.Setup(r => r.AddAsync(It.IsAny<Loan>())).Returns(Task.CompletedTask);

        var request = new LoanRequestDto
        {
            UserId = "user1", Amount = 5000m, TermMonths = 12, MonthlyIncome = 5000m
        };

        var result = await _service.RequestLoanAsync(request);

        Assert.True(result.Success);
        Assert.Equal(LoanStatus.Approved, result.Data!.Status);
    }

    [Fact]
    public async Task RequestLoan_LargeAmount_ShouldStayPending()
    {
        _mockLoanRepo.Setup(r => r.GetActiveLoansCountAsync("user1")).ReturnsAsync(0);
        _mockLoanRepo.Setup(r => r.GetTotalMonthlyPaymentsAsync("user1")).ReturnsAsync(0m);
        _mockLoanRepo.Setup(r => r.AddAsync(It.IsAny<Loan>())).Returns(Task.CompletedTask);

        var request = new LoanRequestDto
        {
            UserId = "user1", Amount = 15_000m, TermMonths = 24, MonthlyIncome = 10_000m
        };

        var result = await _service.RequestLoanAsync(request);

        Assert.True(result.Success);
        Assert.Equal(LoanStatus.Pending, result.Data!.Status);
    }

    [Fact]
    public async Task ApproveLoan_PendingLoan_ShouldChangeToActive()
    {
        var loan = new Loan
        {
            Id = Guid.NewGuid(),
            Status = LoanStatus.Pending,
            Amount = 5000m,
            PaymentSchedules = new List<PaymentSchedule>(),
            Transactions = new List<Transaction>()
        };
        _mockLoanRepo.Setup(r => r.GetByIdWithScheduleAsync(loan.Id)).ReturnsAsync(loan);

        var result = await _service.ApproveLoanAsync(loan.Id);

        Assert.True(result.Success);
        Assert.Equal(LoanStatus.Active, result.Data!.Status);
    }
}
