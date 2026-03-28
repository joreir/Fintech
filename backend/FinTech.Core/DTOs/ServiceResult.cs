namespace FinTech.Core.DTOs;

public class ServiceResult<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }

    public static ServiceResult<T> Ok(T data) => new()
    {
        Success = true,
        Data = data
    };

    public static ServiceResult<T> Fail(string errorMessage) => new()
    {
        Success = false,
        ErrorMessage = errorMessage
    };
}
