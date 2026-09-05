import request from "supertest";
import { nanoid } from "nanoid";

import app from "../../src/app.js";
import { sql } from "../../src/lib/db.js";
import { redis, closeRedis, clearRedis } from "../../src/lib/redis.js";

beforeEach(async () => {
    await clearRedis();
});

afterAll(async () => {
    await sql.end();
    await closeRedis();
});


describe("GET /code/:shortCode", () => {

    test("should redirect to the original URL for a valid short code", async () => {
        const shortCode = nanoid(6);
        const originalUrl = `https://example.com/redirect-${shortCode}`;

        await sql`
            INSERT INTO urls (short_code, original_url, click_count)
            VALUES (${shortCode}, ${originalUrl}, 0)
        `;

        const response = await request(app)
            .get(`/code/${shortCode}`)
            .redirects(0);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe(originalUrl);
    });


    test("should return 404 for a nonexistent short code", async () => {
        const shortCode = nanoid(6);

        const response = await request(app)
            .get(`/code/${shortCode}`)
            .redirects(0);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("No matching url found");
    });


    test("should increment PostgreSQL click_count on a cache miss", async () => {
        const shortCode = nanoid(6);
        const originalUrl = `https://example.com/db-click-${shortCode}`;

        await sql`
            INSERT INTO urls (short_code, original_url, click_count)
            VALUES (${shortCode}, ${originalUrl}, 0)
        `;

        const response = await request(app)
            .get(`/code/${shortCode}`)
            .redirects(0);

        expect(response.statusCode).toBe(302);

        const rows = await sql`
            SELECT click_count
            FROM urls
            WHERE short_code = ${shortCode}
        `;

        expect(rows).toHaveLength(1);
        expect(Number(rows[0].click_count)).toBe(1);
    });


    test("should cache the URL in Redis after a database lookup", async () => {
        const shortCode = nanoid(6);
        const originalUrl = `https://example.com/cache-${shortCode}`;

        await sql`
            INSERT INTO urls (short_code, original_url, click_count)
            VALUES (${shortCode}, ${originalUrl}, 0)
        `;

        const response = await request(app)
            .get(`/code/${shortCode}`)
            .redirects(0);

        expect(response.statusCode).toBe(302);

        const cachedUrl = await redis.get(shortCode);

        expect(cachedUrl).toBe(originalUrl);
    });


    test("should use Redis on a cache hit and increment Redis click count", async () => {
        const shortCode = nanoid(6);
        const originalUrl = `https://example.com/cache-hit-${shortCode}`;

        await sql`
            INSERT INTO urls (short_code, original_url, click_count)
            VALUES (${shortCode}, ${originalUrl}, 0)
        `;

        // Pre-populate Redis to force a cache hit
        await redis.set(shortCode, originalUrl);

        const response = await request(app)
            .get(`/code/${shortCode}`)
            .redirects(0);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe(originalUrl);

        const clickCount = await redis.get(`Clicks:${shortCode}`);

        expect(Number(clickCount)).toBe(1);
    });


    test("should add the short code to pending_clicks on a Redis cache hit", async () => {
        const shortCode = nanoid(6);
        const originalUrl = `https://example.com/pending-${shortCode}`;

        await sql`
            INSERT INTO urls (short_code, original_url, click_count)
            VALUES (${shortCode}, ${originalUrl}, 0)
        `;

        // Force Redis cache hit
        await redis.set(shortCode, originalUrl);

        const response = await request(app)
            .get(`/code/${shortCode}`)
            .redirects(0);

        expect(response.statusCode).toBe(302);

        const pendingClicks = await redis.smembers("pending_clicks");

        expect(pendingClicks).toContain(shortCode);
    });


    test("should redirect to expired page for an expired URL on a cache miss", async () => {
        const shortCode = nanoid(6);
        const originalUrl = `https://example.com/expired-${shortCode}`;

        await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                expires_at
            )
            VALUES (
                ${shortCode},
                ${originalUrl},
                0,
                NOW() - INTERVAL '1 hour'
            )
        `;

        const response = await request(app)
            .get(`/code/${shortCode}`)
            .redirects(0);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location)
            .toBe("http://localhost:5173/expired");
    });


    test("should redirect a non-expired URL and cache it with TTL", async () => {
        const shortCode = nanoid(6);
        const originalUrl = `https://example.com/ttl-${shortCode}`;

        await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                expires_at
            )
            VALUES (
                ${shortCode},
                ${originalUrl},
                0,
                NOW() + INTERVAL '1 hour'
            )
        `;

        const response = await request(app)
            .get(`/code/${shortCode}`)
            .redirects(0);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe(originalUrl);

        const cachedUrl = await redis.get(shortCode);

        expect(cachedUrl).toBe(originalUrl);

        const ttl = await redis.ttl(shortCode);

        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(3601);
    });

});