import { body } from "express-validator";

export const userSignupValidation = () => {
    return [
        // Full Name
        body("userFullName")
            .trim()
            .notEmpty().withMessage("Full Name is required")
            .isLength({ min: 3, max: 50 }).withMessage("Full Name must be between 3 and 50 characters")
            .matches(/^[a-zA-Z\s]+$/).withMessage("Full Name should only contain letters and spaces"),

        // Username
        body("userName")
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters")
            .matches(/^[a-zA-Z0-9._]+$/).withMessage("Username can only contain letters, numbers, dots, and underscores"),

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
