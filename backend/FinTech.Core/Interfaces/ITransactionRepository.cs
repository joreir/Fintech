using FinTech.Core.Entities;
using FinTech.Core.Enums;

namespace FinTech.Core.Interfaces;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<Transaction?> GetByIdempotencyKeyAsync(string key);
    Task<IEnumerable<Transaction>> GetAllAsync(Guid? loanId = null, TransactionType? type = null);
    Task AddAsync(Transaction transaction);
    void Update(Transaction transaction);
}
