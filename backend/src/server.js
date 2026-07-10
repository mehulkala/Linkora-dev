import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import path from "path";

dotenv.config();

const app  = express();
const __dirname = path.resolve();


app.use("/api/auth", authRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("/{*path}", (_, res)=>{
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    })
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server running on port " + PORT))