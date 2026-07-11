import express from "express";
import { codeRedirection } from "../controllers/codeRedirection.js";

const router = express.Router();

router.get("/:id", codeRedirection);

export default router;