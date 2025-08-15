import express from "express";
import cors from "cors";
import morganMiddleware from "./loggers/morganMiddleware.js";
import { resolve } from "path";
import { corsOptions, expressJSONOptions, urlEncodedOptions, staticFolderOptions } from "./utils/optionsObject.js";
import errorHandler from "./middlewares/errorHandler.middlewares.js";

const app = express();

app.use(cors(corsOptions));
app.use(morganMiddleware);
app.use(express.json(expressJSONOptions));
app.use(express.urlencoded(urlEncodedOptions));

const staticFolder = resolve("public"); // automatically resolves to cwd() and then the 'public' folder
app.use(express.static(staticFolder, staticFolderOptions));

import healthCheckRouter from "./routes/healthCheck.routes.js";
app.use("/api/v1/healthcheck", healthCheckRouter);

app.use(errorHandler);

export default app;
