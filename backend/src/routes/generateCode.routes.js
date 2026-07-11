import express from "express";
import { generateCode } from "../controllers/generateCode.js";
const router = express.Router();

router.post("/generate-code", generateCode);

export default router;