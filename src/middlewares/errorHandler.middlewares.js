import StandardError from "../utils/StandardError.js";

const errorHandler = (err, req, res, next) => {
    let errorResponse = err;

    // If the error is not a StandardError, wrap it
    if (!(err instanceof StandardError)) {
        errorResponse = new StandardError(500, err.message || "Internal Server Error", null, err.stack);
    }

    res.status(errorResponse.statusCode).json(errorResponse.toJSON());
};


export default errorHandler;
