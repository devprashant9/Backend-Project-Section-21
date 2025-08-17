import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envConfig from "../configs/env.js";
import crypto from "node:crypto";

const userSchema = new mongoose.Schema({
    userFullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    userName: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        unique: true,
        index: true,
    },
    userEmail: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        index: true,
    },
    userPassword: {
        type: String,
        required: [true, "Password is required"],
    },
    userEmailVerified: {
        type: Boolean,
        default: false,
    },
    userRefreshToken: {
        type: String,
        default: null,
    },
    userEmailVerificationToken: {
        type: String,
        default: null,
    },
    userEmailVerificationTokenExpiry: {
        type: String,
        default: null,
    },
    userForgotPasswordToken: {
        type: String,
        default: null,
    },
    userForgotPasswordTokenExpiry: {
        type: String,
        default: null,
    },
    userAvatar: {
        url: {
            type: String, // direct image URL
            required: false,
        },
        public_id: {
            type: String, // Cloudinary public_id or S3 object key
            required: false,
        },
    }
}, {
    timestamps: true,
});

// an example of pre hook
userSchema.pre("save", async function (next) {
    if (this.isModified("userPassword")) {
        const genSalt = await bcrypt.genSalt(10);
        this.userPassword = await bcrypt.hash(this.userPassword, genSalt);
    }
    next();
});

// an example of method
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.userPassword);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id }, envConfig.accessTokenSecret, {
        expiresIn: envConfig.accessTokenExpiresIn,
    });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, envConfig.refreshTokenSecret, {
        expiresIn: envConfig.refreshTokenExpiresIn,
    });
};

userSchema.methods.generateTemporaryToken = function () {
    const tempUnhashedToken = crypto
        .randomBytes(32)
        .toString("hex");

    const tempHashedToken = crypto
        .createHash("sha256")
        .update(tempUnhashedToken)
        .digest("hex");

    const tempTokenExpiry = Date.now() + (20 * 60 * 1000); // 20 minutes

    return { tempUnhashedToken, tempHashedToken, tempTokenExpiry };
};

const User = mongoose.model("User", userSchema);

export default User;
