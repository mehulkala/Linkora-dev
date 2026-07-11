import express from "express";
import dotenv from "dotenv";
import genRoute from "./routes/generateCode.routes.js";
import codeRoute from "./routes/code.routes.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cors from "cors";

dotenv.config();

const app  = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}));

app.use("/api", genRoute);
app.use("/code", codeRoute);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("/{*path}", (_, res)=>{
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    })
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
    console.log("Server running on port " + PORT);
    connectDB();
});