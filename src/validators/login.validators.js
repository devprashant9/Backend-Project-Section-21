import { body } from "express-validator";

export const userLoginValidation = () => {
    return [
        // Email
        body("userEmail")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email address")
            .normalizeEmail(),

        // Password
        body("userPassword")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
            .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
            .matches(/[0-9]/).withMessage("Password must contain at least one number")
            .matches(/[@$!%*?&#]/).withMessage("Password must contain at least one special character (@, $, !, %, *, ?, &, #)"),
    ];
};
