import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./lib/db.js";
import { syncClicks } from "./workers/syncClicks.js";
import app from "./app.js";

dotenv.config();

const __dirname = path.resolve();

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("/{*path}", (_, res)=>{
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    })
}

const PORT = process.env.PORT || 3000;


async function startBackgroundWorkers() {

    try {
        await syncClicks();
    } catch (err) {
        console.error("Initial sync failed:", err);
    }

    setInterval(async () => {
        try {
            await syncClicks();
        } catch (err) {
            console.error("Periodic sync failed:", err);
        }
    }, 60000);
}

async function startServer() {
    try {
        await connectDB();
        console.log("Database connected");

        await startBackgroundWorkers();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();