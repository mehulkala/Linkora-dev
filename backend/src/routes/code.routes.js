import express from "express";
import { codeRedirection } from "../controllers/codeRedirection.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, codeRedirection);

export default router;