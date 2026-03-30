using FinTech.Core.DTOs;
using FinTech.Core.Enums;

namespace FinTech.Core.Interfaces;

public interface ITransactionService
{
    Task<ServiceResult<TransactionResponseDto>> CreateTransactionAsync(CreateTransactionRequestDto request);
    Task<ServiceResult<TransactionResponseDto>> GetByIdAsync(Guid id);
    Task<ServiceResult<IEnumerable<TransactionResponseDto>>> GetTransactionsAsync(Guid? loanId = null, TransactionType? type = null);
}
