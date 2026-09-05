import { nanoid } from "nanoid";

import { sql } from "../../src/lib/db.js";
import { redis, closeRedis, clearRedis } from "../../src/lib/redis.js";
import { syncClicks } from "../../src/workers/syncClicks.js";


describe("Background Click Sync Integration Tests", () => {

    beforeEach(async () => {
        await clearRedis();
    });

    afterAll(async () => {
        await sql.end();
        await closeRedis();
    });


    test("should sync Redis clicks to PostgreSQL", async () => {
        const shortCode = nanoid(6);

        // Create URL in PostgreSQL
        const result = await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count
            )
            VALUES (
                ${shortCode},
                'https://example.com',
                0
            )
            RETURNING id
        `;

        const urlId = result[0].id;

        // Simulate clicks accumulated in Redis
        await redis.set(`Clicks:${shortCode}`, "5");
        await redis.sadd("pending_clicks", shortCode);

        // Run background synchronization
        await syncClicks();

        // Verify PostgreSQL was updated
        const rows = await sql`
            SELECT click_count
            FROM urls
            WHERE id = ${urlId}
        `;

        expect(Number(rows[0].click_count)).toBe(5);

        // Verify Redis click counter was deleted
        const redisCount = await redis.get(`Clicks:${shortCode}`);

        expect(redisCount).toBeNull();

        // Verify pending_clicks was cleaned up
        const pending = await redis.smembers("pending_clicks");

        expect(pending).not.toContain(shortCode);
    });


    test("should add Redis clicks to an existing PostgreSQL click count", async () => {
        const shortCode = nanoid(6);

        const result = await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count
            )
            VALUES (
                ${shortCode},
                'https://example.com',
                10
            )
            RETURNING id
        `;

        const urlId = result[0].id;

        // Redis has 7 clicks waiting to be synced
        await redis.set(`Clicks:${shortCode}`, "7");
        await redis.sadd("pending_clicks", shortCode);

        await syncClicks();

        const rows = await sql`
            SELECT click_count
            FROM urls
            WHERE id = ${urlId}
        `;

        // 10 existing + 7 Redis clicks
        expect(Number(rows[0].click_count)).toBe(17);

        expect(await redis.get(`Clicks:${shortCode}`)).toBeNull();

        expect(
            await redis.smembers("pending_clicks")
        ).not.toContain(shortCode);
    });


    test("should process multiple pending URLs", async () => {
        const shortCode1 = nanoid(6);
        const shortCode2 = nanoid(6);

        const result = await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count
            )
            VALUES
                (${shortCode1}, 'https://example.com/1', 2),
                (${shortCode2}, 'https://example.com/2', 3)
            RETURNING id, short_code
        `;

        await redis.set(`Clicks:${shortCode1}`, "5");
        await redis.set(`Clicks:${shortCode2}`, "8");

        await redis.sadd("pending_clicks", shortCode1);
        await redis.sadd("pending_clicks", shortCode2);

        await syncClicks();

        const rows = await sql`
            SELECT short_code, click_count
            FROM urls
            WHERE short_code IN (${shortCode1}, ${shortCode2})
            ORDER BY short_code
        `;

        const url1 = rows.find(row => row.short_code === shortCode1);
        const url2 = rows.find(row => row.short_code === shortCode2);

        expect(Number(url1.click_count)).toBe(7);
        expect(Number(url2.click_count)).toBe(11);

        expect(await redis.get(`Clicks:${shortCode1}`)).toBeNull();
        expect(await redis.get(`Clicks:${shortCode2}`)).toBeNull();

        const pending = await redis.smembers("pending_clicks");

        expect(pending).not.toContain(shortCode1);
        expect(pending).not.toContain(shortCode2);
    });


    test("should remove pending URL even when Redis click count is zero", async () => {
        const shortCode = nanoid(6);

        await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count
            )
            VALUES (
                ${shortCode},
                'https://example.com',
                5
            )
        `;

        await redis.set(`Clicks:${shortCode}`, "0");
        await redis.sadd("pending_clicks", shortCode);

        await syncClicks();

        const rows = await sql`
            SELECT click_count
            FROM urls
            WHERE short_code = ${shortCode}
        `;

        // No increment should happen
        expect(Number(rows[0].click_count)).toBe(5);

        // pending_clicks should still be cleaned
        const pending = await redis.smembers("pending_clicks");

        expect(pending).not.toContain(shortCode);
    });
});