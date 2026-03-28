namespace FinTech.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    ILoanRepository Loans { get; }
    Task<int> CommitAsync();
}
