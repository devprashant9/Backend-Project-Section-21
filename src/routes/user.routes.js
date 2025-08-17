import Router from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { userRegister, userLogin, userLogout, userVerifyEmail, generateNewAccessTokens } from "../controllers/user.controllers.js";
import { userSignupValidation } from "../validators/signup.validators.js";
import { userLoginValidation } from "../validators/login.validators.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { uploadImageMemory } from "../middlewares/multer.middlewares.js";
import { authenticateUserRequest } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    uploadImageMemory.single("userAvatar"),
    userSignupValidation(),
    validate,
    asyncHandler(userRegister)
);

router.route("/login").post(
    userLoginValidation(),
    validate,
    asyncHandler(userLogin)
);

router.route("/verify-email/:verificationToken").get(asyncHandler(userVerifyEmail));

router.route("/refresh-token").post(asyncHandler(generateNewAccessTokens))

router.route("/forgot-password").post()

router.rou

// Secure Routes
router.route("/logout").get(authenticateUserRequest, asyncHandler(userLogout));


export default router;
