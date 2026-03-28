using FinTech.Core.Entities;

namespace FinTech.Core.Interfaces;

public interface ILoanRepository
{
    Task<Loan?> GetByIdAsync(Guid id);
    Task<Loan?> GetByIdWithScheduleAsync(Guid id);
    Task<IEnumerable<Loan>> GetByUserIdAsync(string userId);
    Task<int> GetActiveLoansCountAsync(string userId);
    Task<decimal> GetTotalMonthlyPaymentsAsync(string userId);
    Task<IEnumerable<Loan>> GetAllAsync();
    Task AddAsync(Loan loan);
    void Update(Loan loan);
}