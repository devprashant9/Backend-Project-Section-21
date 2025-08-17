import express from "express";
import cors from "cors";
import morganMiddleware from "./loggers/morganMiddleware.js";
import { resolve } from "path";
import { corsOptions, expressJSONOptions, urlEncodedOptions, staticFolderOptions } from "./utils/optionsObject.js";
import errorHandler from "./middlewares/errorHandler.middlewares.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors(corsOptions));
app.use(morganMiddleware);
app.use(express.json(expressJSONOptions));
app.use(express.urlencoded(urlEncodedOptions));
app.use(cookieParser());

const staticFolder = resolve("public"); // automatically resolves to cwd() and then the 'public' folder
app.use(express.static(staticFolder, staticFolderOptions));

import healthCheckRouter from "./routes/healthCheck.routes.js";
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", userRouter);

app.use(errorHandler);

export default app;
