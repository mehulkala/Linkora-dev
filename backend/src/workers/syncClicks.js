import { redis } from "../lib/redis.js";
import { sql } from "../lib/db.js";

export const syncClicks = async () => {
    const pending = await redis.smembers("pending_clicks");

    for (const shortCode of pending) {
        let count = 0;

        try {
            // Atomically take the current batch of clicks.
            // New clicks arriving after this operation form a new batch.
            count = Number(
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

            // Persist this batch to PostgreSQL.
            await sql`
                UPDATE urls
                SET click_count = click_count + ${count}
                WHERE short_code = ${shortCode}
            `;

            // Remove the pending marker only if no newer clicks
            // arrived while the database update was running.
            await redis.eval(
                `
                    if redis.call("EXISTS", KEYS[1]) == 0 then
                        redis.call("SREM", KEYS[2], ARGV[1])
                    end

                    return 1
                `,
                [`Clicks:${shortCode}`, "pending_clicks"],
                [shortCode]
            );

        } catch (error) {
            console.error(
                `Failed to sync clicks for ${shortCode}:`,
                error.message
            );

            if (count > 0) {
                // Restore the batch if PostgreSQL or another operation fails.
                await redis.eval(
                    `
                        redis.call("INCRBY", KEYS[1], ARGV[1])
                        redis.call("SADD", KEYS[2], ARGV[2])

                        return 1
                    `,
                    [`Clicks:${shortCode}`, "pending_clicks"],
                    [count, shortCode]
                );
            }
        }
    }
};