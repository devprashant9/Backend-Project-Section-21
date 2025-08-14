import express from "express";
import cors from "cors";
import morganMiddleware from "./loggers/morganMiddleware.js";

const app = express();

app.use(cors());
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
    res.send("Hello Prashant");
});

export default app;
