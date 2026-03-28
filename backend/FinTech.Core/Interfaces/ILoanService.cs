using FinTech.Core.DTOs;

namespace FinTech.Core.Interfaces;

public interface ILoanService
{
    Task<ServiceResult<LoanSimulationResponseDto>> SimulateLoanAsync(LoanSimulationRequestDto request);
    Task<ServiceResult<LoanResponseDto>> RequestLoanAsync(LoanRequestDto request);
    Task<ServiceResult<LoanResponseDto>> ApproveLoanAsync(Guid loanId);
    Task<ServiceResult<LoanResponseDto>> RejectLoanAsync(Guid loanId);
    Task<ServiceResult<LoanResponseDto>> GetLoanByIdAsync(Guid id);
    Task<ServiceResult<LoanResponseDto>> GetLoanScheduleAsync(Guid id);
    Task<ServiceResult<IEnumerable<LoanResponseDto>>> GetLoansAsync(string? userId = null);
}