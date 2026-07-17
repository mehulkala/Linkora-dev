import express from "express";
import { generateCode } from "../controllers/generateCode.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {dashboard} from "../controllers/dashboard.js";

const router = express.Router();

router.post("/generate-code", protectRoute, generateCode);
router.get("/dashboard", protectRoute, dashboard);

export default router;