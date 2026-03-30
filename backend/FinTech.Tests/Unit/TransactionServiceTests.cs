using FinTech.Core.DTOs;
using FinTech.Core.Entities;
using FinTech.Core.Enums;
using FinTech.Core.Interfaces;
using FinTech.Core.Services;
using Moq;

namespace FinTech.Tests.Unit;

public class TransactionServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ITransactionRepository> _mockTransactionRepo;
    private readonly Mock<ILoanRepository> _mockLoanRepo;
    private readonly TransactionService _service;

    public TransactionServiceTests()
    {
        _mockTransactionRepo = new Mock<ITransactionRepository>();
        _mockLoanRepo = new Mock<ILoanRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockUnitOfWork.Setup(u => u.Transactions).Returns(_mockTransactionRepo.Object);
        _mockUnitOfWork.Setup(u => u.Loans).Returns(_mockLoanRepo.Object);
        _mockUnitOfWork.Setup(u => u.CommitAsync()).ReturnsAsync(1);
        _service = new TransactionService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task CreateTransaction_DuplicateIdempotencyKey_ShouldReturnOriginal()
    {
        var existingTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            IdempotencyKey = "PAY-001",
            Type = TransactionType.Payment,
            Amount = 500m,
            Status = TransactionStatus.Completed,
            CreatedAt = DateTime.UtcNow
        };

        _mockTransactionRepo
            .Setup(r => r.GetByIdempotencyKeyAsync("PAY-001"))
            .ReturnsAsync(existingTransaction);

        var request = new CreateTransactionRequestDto
        {
            IdempotencyKey = "PAY-001",
            Type = TransactionType.Payment,
            Amount = 500m
        };

        var result = await _service.CreateTransactionAsync(request);

        Assert.True(result.Success);
        Assert.Equal(existingTransaction.Id, result.Data!.Id);
        _mockTransactionRepo.Verify(r => r.AddAsync(It.IsAny<Transaction>()), Times.Never);
        _mockUnitOfWork.Verify(u => u.CommitAsync(), Times.Never);
    }
}
