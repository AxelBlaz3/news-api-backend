class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // This line is important for proper stack traces in custom errors
    // (especially when extending built-in classes like Error)
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad request") {
    super(400, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ValidationError extends ApiError {
  errors: { [key: string]: string | undefined }[];
  constructor(
    message: string = "Validation failed",
    errors: { [key: string]: string | undefined }[] = []
  ) {
    super(422, message);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export default ApiError;
