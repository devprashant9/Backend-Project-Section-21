import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";
import envConfig from "../configs/env.js";

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: envConfig.isProd ? "info" : "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, "combined.log") }),
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
  ],
});

// Console output in dev environment
if (envConfig.isDev) {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp, stack }) => {
          const logMsg = stack || message;
          return `[${timestamp}] ${level.toUpperCase()}: ${logMsg}`;
        }),
      ),
    }),
  );
}

export default logger;
