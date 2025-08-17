import { validationResult } from "express-validator";
import StandardError from "../utils/StandardError.js";

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const errorsGenerated = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
    }));

    throw new StandardError(422, "Invalid Inputs Received", errorsGenerated);
};
