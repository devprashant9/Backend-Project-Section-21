
class StandardError extends Error {
    /**
     * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
     * @param {string} message - Human-readable error message
     * @param {Array|Object} [errors] - Optional detailed errors (e.g., validation errors)
     * @param {string} [stack] - Optional stack trace override
     */
    constructor(statusCode = 500, message = "Something went wrong!", errors = null, stack = "") {
        super(message);

        this.statusCode = statusCode;
        this.errors = errors; // optional array or object
        this.message = message;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Convert error to a standard JSON response
     */
    toJSON() {
        return {
            success: false,
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors || undefined, // omit if null
            timestamp: new Date().toISOString()
        };
    }
}

export default StandardError;
