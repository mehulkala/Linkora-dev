import postgres from "postgres";
import { ENV } from "./env.js";

const connectionString = ENV.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined.");
}

export const sql = postgres(connectionString);

export const connectDB = async () => {
    try {
        await sql`SELECT 1`;
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Error connecting to database:", error);
        process.exit(1);
    }
};
