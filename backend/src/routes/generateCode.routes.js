import express from "express";
import { generateCode } from "../controllers/generateCode.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/generate-code", protectRoute, generateCode);

export default router;