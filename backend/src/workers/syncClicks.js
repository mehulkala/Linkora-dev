import { redis } from "../lib/redis.js";
import { sql } from "../lib/db.js";

export const syncClicks = async () => {
    while (true) {
        // Atomically claim one pending shortcode.
        // Only one worker can receive a given member.
        const shortCode = await redis.eval(
            `
                return redis.call("SPOP", KEYS[1])
            `,
            ["pending_clicks"],
            []
        );

        if (!shortCode) {
            break;
        }

        try {
            // Atomically take the current click batch.
            const count = Number(
                await redis.eval(
                    `
                        local count = redis.call("GET", KEYS[1])

                        if count then
                            redis.call("DEL", KEYS[1])
                        end

                        return count or "0"
                    `,
                    [`Clicks:${shortCode}`],
                    []
                )
            );

            if (count === 0) {
                continue;
            }

            await sql`
                UPDATE urls
                SET click_count = click_count + ${count}
                WHERE short_code = ${shortCode}
            `;

        } catch (error) {
            console.error(
                `Failed to sync clicks for ${shortCode}:`,
                error.message
            );

            // Put the shortcode back into the pending set.
            await redis.sadd("pending_clicks", shortCode);
        }
    }
};