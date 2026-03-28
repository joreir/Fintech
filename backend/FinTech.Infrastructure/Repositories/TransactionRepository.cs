using FinTech.Core.Entities;
using FinTech.Core.Enums;
using FinTech.Core.Interfaces;
using FinTech.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinTech.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly ApplicationDbContext _context;

    public TransactionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        return await _context.Transactions.FindAsync(id);
    }

    public async Task<Transaction?> GetByIdempotencyKeyAsync(string key)
    {
        return await _context.Transactions
            .FirstOrDefaultAsync(t => t.IdempotencyKey == key);
    }

    public async Task<IEnumerable<Transaction>> GetAllAsync(Guid? loanId = null, TransactionType? type = null)
    {
        var query = _context.Transactions.AsQueryable();

        if (loanId.HasValue)
            query = query.Where(t => t.LoanId == loanId.Value);

        if (type.HasValue)
            query = query.Where(t => t.Type == type.Value);

        return await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
    }

    public async Task AddAsync(Transaction transaction)
    {
        await _context.Transactions.AddAsync(transaction);
    }

    public void Update(Transaction transaction)
    {
        _context.Transactions.Update(transaction);
    }
}
