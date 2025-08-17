import Router from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    userRegister,
    userLogin,
    userLogout,
    userVerifyEmail,
    resendUserVerifyEmail,
    generateNewAccessTokens,
    getCurrentUser,
    forgotPasswordRequest,
    resetForgotPassword,
    changePassword
} from "../controllers/user.controllers.js";
import { userSignupValidator, userLoginValidator, forgotPasswordRequestValidator, userNewPasswordValidator, changePasswordValidator } from "../validators/user.validators.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { uploadImageMemory } from "../middlewares/multer.middlewares.js";
import { authenticateUserRequest } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    uploadImageMemory.single("userAvatar"),
    userSignupValidator(),
    validate,
    asyncHandler(userRegister)
);

router.route("/login").post(
    userLoginValidator(),
    validate,
    asyncHandler(userLogin)
);

router.route("/verify-email/:verificationToken").get(asyncHandler(userVerifyEmail));

router.route("/refresh-access-token").post(asyncHandler(generateNewAccessTokens));

router.route("/forgot-password").post(forgotPasswordRequestValidator(), validate, asyncHandler(forgotPasswordRequest));

router.route("/reset-forgot-password").post(userNewPasswordValidator(), validate, asyncHandler(resetForgotPassword));

// Secured Routes
router.route("/logout").get(authenticateUserRequest, asyncHandler(userLogout));

router.route("/current-user").get(authenticateUserRequest, asyncHandler(getCurrentUser));

router.route("/change-password").post(changePasswordValidator(), validate, authenticateUserRequest, asyncHandler(changePassword));

router.route("/resend-email-verification").get(authenticateUserRequest, asyncHandler(resendUserVerifyEmail));

export default router;
