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


app.use("/api", apiRoute);
app.use("/code", codeRoute);
app.use("/api/auth", authRoutes);

export default app;