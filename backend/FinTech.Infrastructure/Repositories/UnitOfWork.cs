using FinTech.Core.Interfaces;
using FinTech.Infrastructure.Persistence;

namespace FinTech.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private ILoanRepository? _loans;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public ILoanRepository Loans =>
        _loans ??= new LoanRepository(_context);

    public async Task<int> CommitAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
