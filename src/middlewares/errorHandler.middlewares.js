import StandardError from "../utils/StandardError.js";
import multer from "multer";

const errorHandler = (err, req, res, next) => {
    let errorResponse;

    // Handle Multer-specific errors
    if (err instanceof multer.MulterError) {
        let message = err.message;

        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File too large!";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "Invalid file type or too many files!";
        }

        errorResponse = new StandardError(400, message, null, err.stack);
    }
    // Handle already standardized errors
    else if (err instanceof StandardError) {
        errorResponse = err;
    }
    // Wrap any other unknown error
    else {
        errorResponse = new StandardError(
            500,
            err.message || "Internal Server Error",
            null,
            err.stack
        );
    }

    res.status(errorResponse.statusCode).json(errorResponse.toJSON());
};

export default errorHandler;
