using FinTech.Core.DTOs;
using FinTech.Core.Entities;
using FinTech.Core.Enums;
using FinTech.Core.Interfaces;
using FinTech.Core.Utils;

namespace FinTech.Core.Services;

public class LoanService : ILoanService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITransactionService _transactionService;

    private const decimal MinAmount = 500m;
    private const decimal MaxAmount = 50_000m;
    private const int MinTerm = 6;
    private const int MaxTerm = 60;
    private const decimal DefaultTEA = 0.24m;
    private const decimal MinTEA = 0.18m;
    private const decimal MaxTEA = 0.35m;
    private const int MaxActiveLoans = 3;
    private const decimal MaxDebtToIncomeRatio = 0.40m;
    private const decimal AutoApproveMaxAmount = 10_000m;
    private const int AutoApproveMaxActiveLoans = 2;

    public LoanService(IUnitOfWork unitOfWork, ITransactionService transactionService)
    {
        _unitOfWork = unitOfWork;
        _transactionService = transactionService;
    }

    public Task<ServiceResult<LoanSimulationResponseDto>> SimulateLoanAsync(LoanSimulationRequestDto request)
    {
        var validationError = ValidateAmountAndTerm(request.Amount, request.TermMonths);
        if (validationError != null)
            return Task.FromResult(ServiceResult<LoanSimulationResponseDto>.Fail(validationError));

        var tea = request.InterestRate ?? DefaultTEA;
        var teaValidation = ValidateTEA(tea);
        if (teaValidation != null)
            return Task.FromResult(ServiceResult<LoanSimulationResponseDto>.Fail(teaValidation));

        var tem = FinancialCalculator.CalculateTEM(tea);
        var schedule = FinancialCalculator.GenerateSchedule(request.Amount, tem, request.TermMonths, DateTime.UtcNow);

        var response = new LoanSimulationResponseDto
        {
            MonthlyPayment = Math.Round(schedule.First().TotalPayment, 2),
            TotalInterest = Math.Round(schedule.Sum(s => s.Interest), 2),
            TotalPayment = Math.Round(schedule.Sum(s => s.TotalPayment), 2),
            TEM = Math.Round(tem, 6),
            TEA = tea,
            Schedule = schedule
        };

        return Task.FromResult(ServiceResult<LoanSimulationResponseDto>.Ok(response));
    }

    public async Task<ServiceResult<LoanResponseDto>> RequestLoanAsync(LoanRequestDto request)
    {
        var validationError = ValidateAmountAndTerm(request.Amount, request.TermMonths);
        if (validationError != null)
            return ServiceResult<LoanResponseDto>.Fail(validationError);

        if (string.IsNullOrWhiteSpace(request.UserId))
            return ServiceResult<LoanResponseDto>.Fail("El ID del usuario es requerido.");

        if (request.MonthlyIncome <= 0)
            return ServiceResult<LoanResponseDto>.Fail("Los ingresos mensuales deben ser mayores a 0.");

        var tea = request.InterestRate ?? DefaultTEA;
        var teaValidation = ValidateTEA(tea);
        if (teaValidation != null)
            return ServiceResult<LoanResponseDto>.Fail(teaValidation);

        var activeLoansCount = await _unitOfWork.Loans.GetActiveLoansCountAsync(request.UserId);
        if (activeLoansCount >= MaxActiveLoans)
            return ServiceResult<LoanResponseDto>.Fail(
                $"El cliente ya tiene {activeLoansCount} préstamos activos. El máximo permitido es {MaxActiveLoans}.");

        var tem = FinancialCalculator.CalculateTEM(tea);
        var monthlyPayment = FinancialCalculator.CalculateFixedPayment(request.Amount, tem, request.TermMonths);
        var currentMonthlyPayments = await _unitOfWork.Loans.GetTotalMonthlyPaymentsAsync(request.UserId);
        var totalMonthlyDebt = currentMonthlyPayments + monthlyPayment;
        var maxAllowedDebt = request.MonthlyIncome * MaxDebtToIncomeRatio;

        if (totalMonthlyDebt > maxAllowedDebt)
            return ServiceResult<LoanResponseDto>.Fail(
                $"La suma de cuotas mensuales (${Math.Round(totalMonthlyDebt, 2)}) excede el 40% " +
                $"de los ingresos mensuales (${Math.Round(maxAllowedDebt, 2)}).");

        var schedule = FinancialCalculator.GenerateSchedule(request.Amount, tem, request.TermMonths, DateTime.UtcNow);

        var loan = new Loan
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Amount = request.Amount,
            Term = request.TermMonths,
            InterestRate = tea,
            LoanType = request.LoanType,
            Status = LoanStatus.Pending,
            MonthlyPayment = Math.Round(monthlyPayment, 2),
            MonthlyIncome = request.MonthlyIncome,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in schedule)
        {
            loan.PaymentSchedules.Add(new PaymentSchedule
            {
                Id = Guid.NewGuid(),
                LoanId = loan.Id,
                PaymentNumber = item.PaymentNumber,
                DueDate = item.DueDate,
                TotalPayment = item.TotalPayment,
                Principal = item.Principal,
                Interest = item.Interest,
                RemainingBalance = item.RemainingBalance,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (request.Amount < AutoApproveMaxAmount && activeLoansCount < AutoApproveMaxActiveLoans)
            loan.Status = LoanStatus.Approved;

        await _unitOfWork.Loans.AddAsync(loan);
        await _unitOfWork.CommitAsync();

        return ServiceResult<LoanResponseDto>.Ok(MapToResponseDto(loan));
    }

    public async Task<ServiceResult<LoanResponseDto>> ApproveLoanAsync(Guid loanId)
    {
        var loan = await _unitOfWork.Loans.GetByIdWithScheduleAsync(loanId);
        if (loan == null)
            return ServiceResult<LoanResponseDto>.Fail("Préstamo no encontrado.");

        if (loan.Status != LoanStatus.Pending)
            return ServiceResult<LoanResponseDto>.Fail(
                $"Solo se pueden aprobar préstamos en estado Pending. Estado actual: {loan.Status}.");

        var transactionResult = await _transactionService.CreateTransactionAsync(new CreateTransactionRequestDto
        {
            IdempotencyKey = $"DISBURSEMENT-{loan.Id}",
            Type = TransactionType.Disbursement,
            Amount = loan.Amount,
            LoanId = loan.Id,
            Description = $"Desembolso del préstamo",
        });

        if (!transactionResult.Success)
            return ServiceResult<LoanResponseDto>.Fail(transactionResult.ErrorMessage!);

        loan.Status = LoanStatus.Active;
        loan.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Loans.Update(loan);
        await _unitOfWork.CommitAsync();

        return ServiceResult<LoanResponseDto>.Ok(MapToResponseDto(loan));
    }

    public async Task<ServiceResult<LoanResponseDto>> RejectLoanAsync(Guid loanId)
    {
        var loan = await _unitOfWork.Loans.GetByIdWithScheduleAsync(loanId);
        if (loan == null)
            return ServiceResult<LoanResponseDto>.Fail("Préstamo no encontrado.");

        if (loan.Status != LoanStatus.Pending)
            return ServiceResult<LoanResponseDto>.Fail(
                $"Solo se pueden rechazar préstamos en estado Pending. Estado actual: {loan.Status}.");

        loan.Status = LoanStatus.Rejected;
        loan.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Loans.Update(loan);
        await _unitOfWork.CommitAsync();

        return ServiceResult<LoanResponseDto>.Ok(MapToResponseDto(loan));
    }

    public async Task<ServiceResult<LoanResponseDto>> GetLoanByIdAsync(Guid id)
    {
        var loan = await _unitOfWork.Loans.GetByIdWithScheduleAsync(id);
        if (loan == null)
            return ServiceResult<LoanResponseDto>.Fail("Préstamo no encontrado.");

        return ServiceResult<LoanResponseDto>.Ok(MapToResponseDto(loan));
    }

    public async Task<ServiceResult<LoanResponseDto>> GetLoanScheduleAsync(Guid id)
    {
        var loan = await _unitOfWork.Loans.GetByIdWithScheduleAsync(id);
        if (loan == null)
            return ServiceResult<LoanResponseDto>.Fail("Préstamo no encontrado.");

        return ServiceResult<LoanResponseDto>.Ok(MapToResponseDto(loan));
    }

    public async Task<ServiceResult<IEnumerable<LoanResponseDto>>> GetLoansAsync(string? userId = null)
    {
        IEnumerable<Loan> loans;

        if (!string.IsNullOrWhiteSpace(userId))
            loans = await _unitOfWork.Loans.GetByUserIdAsync(userId);
        else
            loans = await _unitOfWork.Loans.GetAllAsync();

        var response = loans.Select(MapToResponseDto);
        return ServiceResult<IEnumerable<LoanResponseDto>>.Ok(response);
    }

    private static string? ValidateAmountAndTerm(decimal amount, int termMonths)
    {
        if (amount < MinAmount)
            return $"El monto mínimo es ${MinAmount}. Monto solicitado: ${amount}.";
        if (amount > MaxAmount)
            return $"El monto máximo es ${MaxAmount}. Monto solicitado: ${amount}.";
        if (termMonths < MinTerm)
            return $"El plazo mínimo es {MinTerm} meses. Plazo solicitado: {termMonths} meses.";
        if (termMonths > MaxTerm)
            return $"El plazo máximo es {MaxTerm} meses. Plazo solicitado: {termMonths} meses.";
        return null;
    }

    private static string? ValidateTEA(decimal tea)
    {
        if (tea < MinTEA || tea > MaxTEA)
            return $"La TEA debe estar entre {MinTEA * 100}% y {MaxTEA * 100}%. TEA proporcionada: {tea * 100}%.";
        return null;
    }

    private static LoanResponseDto MapToResponseDto(Loan loan)
    {
        return new LoanResponseDto
        {
            Id = loan.Id,
            UserId = loan.UserId,
            Amount = loan.Amount,
            Term = loan.Term,
            InterestRate = loan.InterestRate,
            LoanType = loan.LoanType,
            Status = loan.Status,
            MonthlyPayment = loan.MonthlyPayment,
            MonthlyIncome = loan.MonthlyIncome,
            CreatedAt = loan.CreatedAt,
            PaymentSchedules = loan.PaymentSchedules
                .OrderBy(ps => ps.PaymentNumber)
                .Select(ps => new PaymentScheduleItemDto
                {
                    PaymentNumber = ps.PaymentNumber,
                    DueDate = ps.DueDate,
                    TotalPayment = ps.TotalPayment,
                    Principal = ps.Principal,
                    Interest = ps.Interest,
                    RemainingBalance = ps.RemainingBalance,
                    Status = ps.Status
                }).ToList()
        };
    }
}