import express from "express";
import { ENV } from "./lib/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app  = express();

app.use(express.json());
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}));
app.use(cookieParser());

export default app;