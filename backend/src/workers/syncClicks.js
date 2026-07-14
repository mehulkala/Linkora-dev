import { redis } from "../lib/redis.js";
import { sql } from "../lib/db.js";

export const syncClicks = async () => {
    console.log("Starting sync...");
    const pending = await redis.smembers('pending_clicks');
    for(const shortCode of pending){
        const count = Number(await redis.get(`Clicks:${shortCode}`));
        if(count>0){
            await sql`UPDATE urls SET click_count = click_count+${count} WHERE short_code = ${shortCode}`;
            await redis.del(`Clicks:${shortCode}`);
        }
        await redis.srem('pending_clicks', shortCode);
        console.log(`Updated ${shortCode} by ${count}`);
    }

    console.log("Sync Completed.");
}