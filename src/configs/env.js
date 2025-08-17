import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";

const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);

// Always load the backend/.env file
dotenv.config({
    path: resolve(directory, "../../.env")
});

// Freeze and export config so it's immutable
const envConfig = Object.freeze({
    port: process.env.PORT,
    mongoDB: process.env.MONGO_URI,
    clientURL: process.env.CLIENT_URL,
    accessTokenSecret: process.env.JWT_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    mailtrap: {
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
    },
    nodeEnv: process.env.NODE_ENV || "development",
    isDev: (process.env.NODE_ENV || "development") === "development",
    isProd: (process.env.NODE_ENV || "development") === "production",
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_SECRET_KEY,
    },
});

export default envConfig;
