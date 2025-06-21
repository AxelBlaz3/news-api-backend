"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.BadRequestError = exports.NotFoundError = void 0;
class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        // This line is important for proper stack traces in custom errors
        // (especially when extending built-in classes like Error)
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
class NotFoundError extends ApiError {
    constructor(message = "Resource not found") {
        super(404, message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends ApiError {
    constructor(message = "Bad request") {
        super(400, message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends ApiError {
    errors;
    constructor(message = "Validation failed", errors = []) {
        super(422, message);
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
exports.default = ApiError;
//# sourceMappingURL=ApiError.js.map