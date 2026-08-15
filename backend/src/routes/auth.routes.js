import express from "express";
import { codeRedirection } from "../controllers/codeRedirection.js";
import { loginHandle, logoutHandle, meHandle, signupHandle } from "../controllers/auth.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware..js";

const router = express.Router();

router.post("/login", rateLimiter({limit:5, window:60}), loginHandle);
router.post("/signup", rateLimiter({limit:5, window:60}), signupHandle);
router.post("/logout", logoutHandle);

router.get("/me", protectRoute, meHandle);

export default router;