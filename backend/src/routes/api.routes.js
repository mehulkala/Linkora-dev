import express from "express";
import { generateCode } from "../controllers/generateCode.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {dashboard} from "../controllers/dashboard.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware..js";

const router = express.Router();

router.post("/generate-code", protectRoute, rateLimiter({limit:10, window:60}), generateCode);
router.get("/dashboard", protectRoute, dashboard);

export default router;