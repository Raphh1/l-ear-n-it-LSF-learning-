namespace LsfApi.Common;

public class Error
{
    public string Code { get; }
    public string Message { get; }

    public Error(string code, string message)
    {
        Code = code;
        Message = message;
    }

    public static readonly Error NotFound = new("not_found", "Resource not found.");
    public static readonly Error Unauthorized = new("unauthorized", "Unauthorized.");
    public static readonly Error Forbidden = new("forbidden", "Forbidden.");
}

public class Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;

    private Result(T value) => Value = value;
    private Result(Error error) => Error = error;

    public static Result<T> Ok(T value) => new(value);
    public static Result<T> Fail(Error error) => new(error);
}
