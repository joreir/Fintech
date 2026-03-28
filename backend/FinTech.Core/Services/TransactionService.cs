using FinTech.Core.DTOs;
using FinTech.Core.Entities;
using FinTech.Core.Enums;
using FinTech.Core.Interfaces;

namespace FinTech.Core.Services;

public class TransactionService : ITransactionService
{
    private readonly IUnitOfWork _unitOfWork;

    public TransactionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<TransactionResponseDto>> CreateTransactionAsync(CreateTransactionRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.IdempotencyKey))
            return ServiceResult<TransactionResponseDto>.Fail("El IdempotencyKey es requerido.");

        if (request.Amount <= 0)
            return ServiceResult<TransactionResponseDto>.Fail("El monto debe ser mayor a 0.");

        var existing = await _unitOfWork.Transactions.GetByIdempotencyKeyAsync(request.IdempotencyKey);
        if (existing != null)
            return ServiceResult<TransactionResponseDto>.Ok(MapToDto(existing));

        if (request.LoanId.HasValue)
        {
            var loan = await _unitOfWork.Loans.GetByIdAsync(request.LoanId.Value);
            if (loan == null)
                return ServiceResult<TransactionResponseDto>.Fail("Préstamo no encontrado.");
        }

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            IdempotencyKey = request.IdempotencyKey,
            Type = request.Type,
            Amount = request.Amount,
            Status = TransactionStatus.Completed,
            LoanId = request.LoanId,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Transactions.AddAsync(transaction);
        await _unitOfWork.CommitAsync();

        return ServiceResult<TransactionResponseDto>.Ok(MapToDto(transaction));
    }

    public async Task<ServiceResult<TransactionResponseDto>> GetByIdAsync(Guid id)
    {
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(id);
        if (transaction == null)
            return ServiceResult<TransactionResponseDto>.Fail("Transacción no encontrada.");

        return ServiceResult<TransactionResponseDto>.Ok(MapToDto(transaction));
    }

    public async Task<ServiceResult<IEnumerable<TransactionResponseDto>>> GetTransactionsAsync(
        Guid? loanId = null, TransactionType? type = null)
    {
        var transactions = await _unitOfWork.Transactions.GetAllAsync(loanId, type);
        var response = transactions.Select(MapToDto);
        return ServiceResult<IEnumerable<TransactionResponseDto>>.Ok(response);
    }

    private static TransactionResponseDto MapToDto(Transaction t)
    {
        return new TransactionResponseDto
        {
            Id = t.Id,
            IdempotencyKey = t.IdempotencyKey,
            Type = t.Type,
            Amount = t.Amount,
            Status = t.Status,
            LoanId = t.LoanId,
            Description = t.Description,
            CreatedAt = t.CreatedAt
        };
    }
}
