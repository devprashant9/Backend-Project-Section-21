import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Always load the backend/.env file
dotenv.config({
    path: resolve(__dirname, "../../.env")
});

// Freeze and export config so it's immutable
const envConfig = Object.freeze({
    port: process.env.PORT,
    mongoDB: process.env.MONGO_URI,
    clientURL: process.env.CLIENT_URL,
    nodeEnv: process.env.NODE_ENV || "development",
    isDev: (process.env.NODE_ENV || "development") === "development",
    isProd: (process.env.NODE_ENV || "development") === "production"
});

export default envConfig;
