import Router from "express";
import { healthCheck } from "../controllers/healthCheck.controllers.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";


const router = Router();

router.route("/").get(asyncHandler(healthCheck));

export default router;
