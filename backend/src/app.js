import express from "express";
import { ENV } from "./lib/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoute from "./routes/api.routes.js";
import codeRoute from "./routes/code.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { redis } from "./lib/redis.js";

const app  = express();

app.use(express.json());
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}));
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

app.use("/api", apiRoute);
app.use("/code", codeRoute);
app.use("/api/auth", authRoutes);

export default app;