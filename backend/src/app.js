import express from "express";
import { ENV } from "./lib/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoute from "./routes/api.routes.js";
import codeRoute from "./routes/code.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app  = express();

app.use(express.json());
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}));
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

app.get("/benchmark/redis/:id", async (req, res) => {
    try {
        const original_url = await redis.get(req.params.id);

        if (!original_url) {
            return res.status(404).json({
                message: "Short code not found in Redis"
            });
        }

        return res.status(200).json({
            cached: true
        });
    } catch (error) {
        console.error("Redis benchmark error:", error);
        return res.status(500).json({
            message: "Redis error"
        });
    }
});

app.use("/api", apiRoute);
app.use("/code", codeRoute);
app.use("/api/auth", authRoutes);

export default app;