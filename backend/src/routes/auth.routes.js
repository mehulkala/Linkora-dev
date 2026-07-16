import express from "express";
import { codeRedirection } from "../controllers/codeRedirection.js";
import { loginHandle, logoutHandle, meHandle, signupHandle } from "../controllers/auth.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", loginHandle);
router.post("/signup", signupHandle);
router.post("/logout", logoutHandle);

router.get("/me", protectRoute, meHandle);

export default router;