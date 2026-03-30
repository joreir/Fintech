namespace FinTech.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    ILoanRepository Loans { get; }
    ITransactionRepository Transactions { get; }
    Task<int> CommitAsync();
}
