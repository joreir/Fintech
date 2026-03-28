using FinTech.Core.Entities;
using FinTech.Core.Enums;
using FinTech.Core.Interfaces;
using FinTech.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinTech.Infrastructure.Repositories;

public class LoanRepository : ILoanRepository
{
    private readonly ApplicationDbContext _context;

    public LoanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Loan?> GetByIdAsync(Guid id)
    {
        return await _context.Loans.FindAsync(id);
    }

    public async Task<Loan?> GetByIdWithScheduleAsync(Guid id)
    {
        return await _context.Loans
            .Include(l => l.PaymentSchedules)
            .Include(l => l.Transactions)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<IEnumerable<Loan>> GetByUserIdAsync(string userId)
    {
        return await _context.Loans
            .Include(l => l.PaymentSchedules)
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetActiveLoansCountAsync(string userId)
    {
        return await _context.Loans
            .CountAsync(l => l.UserId == userId &&
                           (l.Status == LoanStatus.Active ||
                            l.Status == LoanStatus.Approved ||
                            l.Status == LoanStatus.Pending));
    }

    public async Task<decimal> GetTotalMonthlyPaymentsAsync(string userId)
    {
        return await _context.Loans
            .Where(l => l.UserId == userId &&
                       (l.Status == LoanStatus.Active ||
                        l.Status == LoanStatus.Approved))
            .SumAsync(l => l.MonthlyPayment);
    }

    public async Task<IEnumerable<Loan>> GetAllAsync()
    {
        return await _context.Loans
            .Include(l => l.PaymentSchedules)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Loan loan)
    {
        await _context.Loans.AddAsync(loan);
    }

    public void Update(Loan loan)
    {
        _context.Loans.Update(loan);
    }
}