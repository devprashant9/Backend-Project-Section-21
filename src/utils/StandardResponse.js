class StandardResponse {
    /**
     * @param {number} statusCode - HTTP status code (e.g., 200, 201, 400)
     * @param {any} data - The main payload of the response
     * @param {string} message - Optional message
     * @param {object} [meta] - Optional metadata (pagination, counts, etc.)
     */
    constructor(statusCode = 200, data = null, message = "Success", meta = null) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
        this.meta = meta || undefined;
    }

    /**
     * Convert the response to JSON
     */
    toJSON() {
        const response = {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data
        };

        if (this.meta) {
            response.meta = this.meta;
        }

        return response;
    }
}

export default StandardResponse;
