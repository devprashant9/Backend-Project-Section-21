import User from '../models/user.models.js';
import StandardResponse from '../utils/standardResponse.js';
import StandardError from '../utils/StandardError.js';
import { emailService } from '../utils/emailTempelate.js';
import { uploadUserAvatar } from '../configs/cloudinary.js';
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import envConfig from '../configs/env.js';

export const userRegister = async (req, res) => {
    const { userFullName, userName, userEmail, userPassword } = req.body;
    const userAvatar = req.file;

    const existingUser = await User.findOne({
        $or: [{ userName }, { userEmail }]
    });
    if (existingUser) {
        throw new StandardError(409, "User Already Exists");
    }

    if (!userAvatar) {
        throw new StandardError(400, "User Avatar is Required");
    }

    const uploadResult = await uploadUserAvatar(userAvatar.buffer, "avatars");

    const newUser = await User.create({
        userFullName,
        userName,
        userEmail,
        userPassword,
        userEmailVerified: false,
        userAvatar: {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        }
    });

    const { tempUnhashedToken, tempHashedToken, tempTokenExpiry } = newUser.generateTemporaryToken();

    newUser.userEmailVerificationToken = tempHashedToken;
    newUser.userEmailVerificationTokenExpiry = tempTokenExpiry;

    await newUser.save({ validateBeforeSave: false });

    await emailService.sendEmail(
        emailService.generateWelcomeEmail(
            newUser.userFullName,
            newUser.userEmail,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${tempUnhashedToken}`
        )
    );

    const createdUser = await User.findById(newUser._id).select("-userRefreshToken -userEmailVerificationToken -userEmailVerificationTokenExpiry -userForgotPasswordToken -userForgotPasswordTokenExpiry -userAvatar.public_id");

    if (!createdUser) {
        throw new StandardError(500, "Error Occurred While Registering User");
    }

    return res
        .status(201)
        .json(new StandardResponse(200, { user: createdUser }, "User Created and Saved Successfully and Email Verification Sent"));
};

const generateAccessTokenRefreshToken = async (userId) => {
    try {
        const getUser = await User.findById(userId);
        const userAccessToken = getUser.generateAccessToken();
        const userRefreshToken = getUser.generateRefreshToken();

        getUser.userRefreshToken = userRefreshToken;
        await getUser.save({ validateBeforeSave: false });

        return { userAccessToken, userRefreshToken };
    } catch (error) {
        throw new StandardError(500, "Something Went Wrong During Token Generation");
    }
};

export const userLogin = async (req, res) => {
    const { userEmail, userPassword } = req.body;

    const findUser = await User.findOne({ userEmail });
    if (!findUser) {
        throw new StandardError(404, "User With Details Not Found");
    }

    const verifyLogin = await findUser.comparePassword(userPassword);
    if (!verifyLogin) {
        throw new StandardError(400, "Password is Wrong");
    }

    const { userAccessToken, userRefreshToken } = await generateAccessTokenRefreshToken(findUser._id);

    const loggedInUser = await User.findById(findUser._id)
        .select("-userRefreshToken -userEmailVerificationToken -userEmailVerificationTokenExpiry -userForgotPasswordToken -userForgotPasswordTokenExpiry -userAvatar.public_id");

    return res
        .status(200)
        .cookie("userAccessToken", userAccessToken, { httpOnly: true, secure: true })
        .cookie("userRefreshToken", userRefreshToken, { httpOnly: true, secure: true })
        .json(new StandardResponse(200, { user: loggedInUser, userAccessToken, userRefreshToken }, "User Logged In Successfully"));
};

export const userLogout = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.userRefreshToken = null;
        await user.save({ validateBeforeSave: false });

        res.clearCookie("userAccessToken");
        res.clearCookie("userRefreshToken");

        return res.status(200).json(new StandardResponse(200, {}, "User Logged Out Successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const getCurrentUser = async (req, res) => {
    const userId = req.user.id;

    const findUser = await User.findById(userId);
    if (!findUser) {
        throw new StandardError(400, "User Not Found");
    }

    const currentUser = await User.findById(findUser._id)
        .select("-userRefreshToken -userEmailVerificationToken -userEmailVerificationTokenExpiry -userForgotPasswordToken -userForgotPasswordTokenExpiry -userAvatar.public_id");

    return res.status(200).json(new StandardResponse(200, currentUser, "User Fetched Successfully"));
};

export const userVerifyEmail = async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new StandardError(400, "Email Verification Token Missing");
    }

    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const getUser = await User.findOne({
        userEmailVerificationToken: hashedToken,
        userEmailVerificationTokenExpiry: { $gt: Date.now() }
    });

    if (!getUser) {
        throw new StandardError(400, "Email Verification Link Expired");
    }

    getUser.userEmailVerificationToken = undefined;
    getUser.userEmailVerificationTokenExpiry = undefined;


    getUser.userEmailVerified = true;

    await getUser.save({ validateBeforeSave: false });

    return res.status(200).json(new StandardResponse(200, { userEmailVerification: true }, "User Email Verified Successfully"));
};

export const resendUserVerifyEmail = async (req, res) => {
    const userId = req.user?.id;

    const findUser = await User.findById(userId);

    if (!findUser) {
        throw new StandardError(404, "User Not Found");
    }

    if (findUser.userEmailVerified) {
        throw new StandardError(409, "User Email Already Verified")
    }

    const { tempUnhashedToken, tempHashedToken, tempTokenExpiry } = findUser.generateTemporaryToken();

    findUser.userEmailVerificationToken = tempHashedToken;
    findUser.userEmailVerificationTokenExpiry = tempTokenExpiry;

    await findUser.save({ validateBeforeSave: false });

    await emailService.sendEmail(
        emailService.generateWelcomeEmail(
            findUser.userFullName,
            findUser.userEmail,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${tempUnhashedToken}`
        )
    );

    return res.status(200).json(new StandardResponse(200, {
        verificationEmail: "Sent on Registered Email Address"
    }, "Verification Email Has Been Re-Sent to Registered Email"))
};

export const generateNewAccessTokens = async (req, res) => {
    const incomingRefreshToken = req.cookies.userRefreshToken || req.body.userRefreshToken;

    if (!incomingRefreshToken) {
        throw new StandardError(401, "Not Authorized To Access")
    }

    const decodedRefreshToken = jwt.verify(incomingRefreshToken, envConfig.refreshTokenSecret);

    const findUser = await User.findById(decodedRefreshToken.id);
    if (!findUser) {
        throw new StandardError(404, "Invalid Refresh Token Provided. User Not Found");
    }

    if (incomingRefreshToken !== findUser.userRefreshToken) {
        throw new StandardError(400, "Refresh Token Expired");
    }

    const { userAccessToken, userRefreshToken: newRefreshToken } = await generateAccessTokenRefreshToken(findUser._id);

    findUser.userRefreshToken = newRefreshToken;
    await findUser.save({ validateBeforeSave: false });

    const response = new StandardResponse(
        200,
        { userAccessToken, userRefreshToken: newRefreshToken },
        "Access Token Refreshed"
    );

    return res
        .status(200)
        .cookie("userAccessToken", userAccessToken, { httpOnly: true, secure: true })
        .cookie("userRefreshToken", newRefreshToken, { httpOnly: true, secure: true })
        .json(response.toJSON());
}

export const forgotPasswordRequest = async (req, res) => {
    const { userEmail } = req.body;

    const findUser = await User.findOne({ userEmail });

    if (!findUser) {
        throw new StandardError(404, "User Not Found");
    }

    const { tempUnhashedToken, tempHashedToken, tempTokenExpiry } = findUser.generateTemporaryToken();

    findUser.userForgotPasswordToken = tempHashedToken;
    findUser.userForgotPasswordTokenExpiry = tempTokenExpiry;

    await findUser.save({ validateBeforeSave: false });

    await emailService.sendEmail(
        emailService.generatePasswordResetEmail(
            findUser.userFullName,
            findUser.userEmail,
            `${req.protocol}://${req.get("host")}/api/v1/auth/forgot-password/${tempUnhashedToken}`
        )
    );

    const response = new StandardResponse(200, {
        passwordResetMailSent: true
    }, "Reset Password Mail Send Successfully");

    return res.status(200).json(response.toJSON());
}

export const resetForgotPassword = async (req, res) => {
    const { resetPasswordToken } = req.params;
    const { userNewPassword } = req.body;

    const hashedResetPasswordToken = crypto
        .createHash("sha256")
        .update(resetPasswordToken)
        .digest("hex");

    const findUser = await User.findOne({
        userForgotPasswordToken: hashedResetPasswordToken,
        userForgotPasswordTokenExpiry: { $gt: Date.now() }
    })

    if (!findUser) {
        throw new StandardError(489, "Token is Inavlid or Expired");
    }

    findUser.userForgotPasswordToken = undefined;
    findUser.userForgotPasswordTokenExpiry = undefined;

    findUser.userPassword = userNewPassword;
    await findUser.save({ validateBeforeSave: false });

    if (findUser.userForgotPasswordToken !== hashedResetPasswordToken) {
        throw new StandardError(400, "Inavlid Password Reset Link");
    }

    const response = new StandardResponse(200, { passwordChanged: true }, "Password Reset Successfull");

    return res.status(200).json(response.toJSON());
};

export const changePassword = async (req, res) => {
    const { userOldPassword, userNewPassword } = req.body;
    const userId = req.user?.id;

    const findUser = await User.findById(userId);
    if (!findUser) {
        throw new StandardError(404, "User Not Found");
    }

    const isPasswordValid = findUser.comparePassword(userOldPassword);
    if (!isPasswordValid) {
        throw new StandardError(400, "Wrong Old Password");
    }

    if (isPasswordValid && (findUser.userPassword === userNewPassword)) {
        throw new StandardError(400, "Please Try a Different New Password");
    }

    findUser.userPassword = userNewPassword;
    await findUser.save({ validateBeforeSave: false });

    const response = new StandardResponse(200, {
        passwordChanged: true,
    }, "Password Changed Successfully")

    return res.status(200).json(response.toJSON());
};


