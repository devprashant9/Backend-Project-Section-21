import morgan from "morgan";
import logger from "./winston.js";

// text format for HTTP logs
const morganFormat = ":method :url :status :response-time ms - :res[content-length]";

const stream = {
    write: (message) => logger.http(message.trim())
};

const morganMiddleware = morgan(morganFormat, { stream });

export default morganMiddleware;
