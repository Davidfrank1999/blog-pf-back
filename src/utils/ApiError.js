// blueprint for API errors
export class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperationalError = true; // distinguish between operational errors and programming errors
        Error.captureStackTrace(this, this.constructor); // excludes parts you don’t care about
    }
}