using FinTech.Core.DTOs;
using FinTech.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FinTech.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoansController : ControllerBase
{
    private readonly ILoanService _loanService;

    public LoansController(ILoanService loanService)
    {
        _loanService = loanService;
    }

    [HttpPost("simulate")]
    public async Task<IActionResult> Simulate([FromBody] LoanSimulationRequestDto request)
    {
        var result = await _loanService.SimulateLoanAsync(request);
        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> RequestLoan([FromBody] LoanRequestDto request)
    {
        var result = await _loanService.RequestLoanAsync(request);
        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpGet]
    public async Task<IActionResult> GetLoans([FromQuery] string? userId = null)
    {
        var result = await _loanService.GetLoansAsync(userId);
        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(result.Data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _loanService.GetLoanByIdAsync(id);
        if (!result.Success)
            return NotFound(new { error = result.ErrorMessage });

        return Ok(result.Data);
    }

    [HttpGet("{id:guid}/schedule")]
    public async Task<IActionResult> GetSchedule(Guid id)
    {
        var result = await _loanService.GetLoanScheduleAsync(id);
        if (!result.Success)
            return NotFound(new { error = result.ErrorMessage });

        return Ok(result.Data);
    }

    [HttpPatch("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _loanService.ApproveLoanAsync(id);
        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(result.Data);
    }

    [HttpPatch("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var result = await _loanService.RejectLoanAsync(id);
        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(result.Data);
    }
}
