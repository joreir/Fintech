using FinTech.Core.DTOs;
using FinTech.Core.Enums;
using FinTech.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FinTech.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionRequestDto request)
    {
        var result = await _transactionService.CreateTransactionAsync(request);
        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] Guid? loanId = null,
        [FromQuery] TransactionType? type = null)
    {
        var result = await _transactionService.GetTransactionsAsync(loanId, type);
        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(result.Data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _transactionService.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(new { error = result.ErrorMessage });

        return Ok(result.Data);
    }
}
