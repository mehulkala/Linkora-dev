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


describe("GET /api/dashboard", () => {

    test("should return dashboard data for an authenticated user", async () => {
        const timestamp = Date.now();

        const username = `dashboard_${timestamp}`;
        const email = `dashboard_${timestamp}@example.com`;

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const response = await agent
            .get("/api/dashboard");

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Data Fetched Successfully");

        expect(response.body.data).toHaveProperty("stats");
        expect(response.body.data).toHaveProperty("urls");

        expect(response.body.data.stats)
            .toHaveProperty("totalClicks");

        expect(response.body.data.stats)
            .toHaveProperty("totalUrls");

        expect(response.body.data.stats)
            .toHaveProperty("averageClicks");

        expect(response.body.data.stats)
            .toHaveProperty("activeUrls");

        expect(Array.isArray(response.body.data.urls))
            .toBe(true);
    });


    test("should reject dashboard access without authentication", async () => {
        const response = await request(app)
            .get("/api/dashboard");

        expect(response.statusCode).toBe(401);
    });


    test("should return correct dashboard statistics", async () => {
        const timestamp = Date.now();

        const username = `stats_${timestamp}`;
        const email = `stats_${timestamp}@example.com`;

        const code1 = nanoid(6);
        const code2 = nanoid(6);
        const code3 = nanoid(6);

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const user = await sql`
            SELECT id
            FROM users
            WHERE username = ${username}
        `;

        expect(user).toHaveLength(1);

        const userId = user[0].id;

        await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                user_id
            )
            VALUES
                (
                    ${code1},
                    'https://example.com/1',
                    10,
                    ${userId}
                ),
                (
                    ${code2},
                    'https://example.com/2',
                    20,
                    ${userId}
                ),
                (
                    ${code3},
                    'https://example.com/3',
                    5,
                    ${userId}
                )
        `;

        const response = await agent
            .get("/api/dashboard");

        expect(response.statusCode).toBe(200);

        const stats = response.body.data.stats;

        expect(stats.totalUrls).toBe(3);
        expect(stats.totalClicks).toBe(35);
        expect(stats.averageClicks).toBe(12);
        expect(stats.activeUrls).toBe(3);
    });


    test("should exclude expired URLs from activeUrls", async () => {
        const timestamp = Date.now();

        const username = `active_${timestamp}`;
        const email = `active_${timestamp}@example.com`;

        const activeCode = nanoid(6);
        const expiredCode = nanoid(6);

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const user = await sql`
            SELECT id
            FROM users
            WHERE username = ${username}
        `;

        expect(user).toHaveLength(1);

        const userId = user[0].id;

        await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                user_id,
                expires_at
            )
            VALUES
                (
                    ${activeCode},
                    'https://example.com/active',
                    10,
                    ${userId},
                    NOW() + INTERVAL '1 hour'
                ),
                (
                    ${expiredCode},
                    'https://example.com/expired',
                    20,
                    ${userId},
                    NOW() - INTERVAL '1 hour'
                )
        `;

        const response = await agent
            .get("/api/dashboard");

        expect(response.statusCode).toBe(200);

        const stats = response.body.data.stats;

        expect(stats.totalUrls).toBe(2);
        expect(stats.totalClicks).toBe(30);
        expect(stats.activeUrls).toBe(1);
    });


    test("should only return URLs belonging to the authenticated user", async () => {
        const timestamp = Date.now();

        const ownerUsername = `owner_${timestamp}`;
        const ownerEmail = `owner_${timestamp}@example.com`;

        const otherUsername = `other_${timestamp}`;
        const otherEmail = `other_${timestamp}@example.com`;

        const ownerCode = nanoid(6);
        const otherCode = nanoid(6);

        const ownerAgent = request.agent(app);
        const otherAgent = request.agent(app);

        // Create owner
        const ownerSignupResponse = await ownerAgent
            .post("/api/auth/signup")
            .send({
                username: ownerUsername,
                email: ownerEmail,
                password: "Password123!"
            });

        expect(ownerSignupResponse.statusCode).toBe(201);

        // Create second user
        const otherSignupResponse = await otherAgent
            .post("/api/auth/signup")
            .send({
                username: otherUsername,
                email: otherEmail,
                password: "Password123!"
            });

        expect(otherSignupResponse.statusCode).toBe(201);

        const users = await sql`
            SELECT id, username
            FROM users
            WHERE username IN (
                ${ownerUsername},
                ${otherUsername}
            )
        `;

        expect(users).toHaveLength(2);

        const owner = users.find(
            user => user.username === ownerUsername
        );

        const otherUser = users.find(
            user => user.username === otherUsername
        );

        await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                user_id
            )
            VALUES
                (
                    ${ownerCode},
                    'https://example.com/owner',
                    10,
                    ${owner.id}
                ),
                (
                    ${otherCode},
                    'https://example.com/other',
                    20,
                    ${otherUser.id}
                )
        `;

        const response = await ownerAgent
            .get("/api/dashboard");

        expect(response.statusCode).toBe(200);

        const urls = response.body.data.urls;

        expect(urls).toHaveLength(1);

        expect(urls[0].original_url)
            .toBe("https://example.com/owner");

        expect(urls[0].short_code)
            .toBe(ownerCode);
    });


    test("should return zero statistics when the user has no URLs", async () => {
        const timestamp = Date.now();

        const username = `empty_dashboard_${timestamp}`;
        const email = `empty_dashboard_${timestamp}@example.com`;

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const response = await agent
            .get("/api/dashboard");

        expect(response.statusCode).toBe(200);

        const stats = response.body.data.stats;

        expect(stats.totalUrls).toBe(0);
        expect(stats.totalClicks).toBe(0);
        expect(stats.averageClicks).toBe(0);
        expect(stats.activeUrls).toBe(0);

        expect(response.body.data.urls).toHaveLength(0);
    });


    test("should include the generated shortUrl for each URL", async () => {
        const timestamp = Date.now();

        const username = `shorturl_${timestamp}`;
        const email = `shorturl_${timestamp}@example.com`;

        const shortCode = nanoid(6);

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const user = await sql`
            SELECT id
            FROM users
            WHERE username = ${username}
        `;

        expect(user).toHaveLength(1);

        await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                user_id
            )
            VALUES (
                ${shortCode},
                'https://example.com/dashboard',
                5,
                ${user[0].id}
            )
        `;

        const response = await agent
            .get("/api/dashboard");

        expect(response.statusCode).toBe(200);

        const url = response.body.data.urls[0];

        expect(url.short_code).toBe(shortCode);

        expect(url.shortUrl)
            .toBe(`http://localhost:3000/code/${shortCode}`);
    });

});


describe("DELETE /api/urls/:id", () => {

    test("should delete a URL belonging to the authenticated user", async () => {
        const timestamp = Date.now();

        const username = `delete_${timestamp}`;
        const email = `delete_${timestamp}@example.com`;
        const shortCode = nanoid(6);

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const user = await sql`
            SELECT id
            FROM users
            WHERE username = ${username}
        `;

        expect(user).toHaveLength(1);

        const inserted = await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                user_id
            )
            VALUES (
                ${shortCode},
                'https://example.com/delete',
                5,
                ${user[0].id}
            )
            RETURNING id
        `;

        const urlId = inserted[0].id;

        const response = await agent
            .delete(`/api/urls/${urlId}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Url deleted successfully");

        const urls = await sql`
            SELECT id
            FROM urls
            WHERE id = ${urlId}
        `;

        expect(urls).toHaveLength(0);
    });


    test("should reject URL deletion without authentication", async () => {
        const response = await request(app)
            .delete("/api/urls/999999999");

        expect(response.statusCode).toBe(401);
    });


    test("should not allow a user to delete another user's URL", async () => {
        const timestamp = Date.now();

        const ownerUsername = `owner_del_${timestamp}`;
        const ownerEmail = `owner_del_${timestamp}@example.com`;

        const otherUsername = `other_del_${timestamp}`;
        const otherEmail = `other_del_${timestamp}@example.com`;

        const shortCode = nanoid(6);

        const ownerAgent = request.agent(app);
        const otherAgent = request.agent(app);

        // Create URL owner
        const ownerSignup = await ownerAgent
            .post("/api/auth/signup")
            .send({
                username: ownerUsername,
                email: ownerEmail,
                password: "Password123!"
            });

        expect(ownerSignup.statusCode).toBe(201);

        const owner = await sql`
            SELECT id
            FROM users
            WHERE username = ${ownerUsername}
        `;

        expect(owner).toHaveLength(1);

        // Create second user
        const otherSignup = await otherAgent
            .post("/api/auth/signup")
            .send({
                username: otherUsername,
                email: otherEmail,
                password: "Password123!"
            });

        expect(otherSignup.statusCode).toBe(201);

        const inserted = await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                user_id
            )
            VALUES (
                ${shortCode},
                'https://example.com/owner-url',
                5,
                ${owner[0].id}
            )
            RETURNING id
        `;

        const urlId = inserted[0].id;

        const response = await otherAgent
            .delete(`/api/urls/${urlId}`);

        expect(response.statusCode).toBe(404);

        expect(response.body.message)
            .toBe("Url Not Found");

        // URL must still exist
        const urls = await sql`
            SELECT id
            FROM urls
            WHERE id = ${urlId}
        `;

        expect(urls).toHaveLength(1);
    });


    test("should return 404 when deleting a nonexistent URL", async () => {
        const timestamp = Date.now();

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username: `notfound_${timestamp}`,
                email: `notfound_${timestamp}@example.com`,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const response = await agent
            .delete("/api/urls/999999999");

        expect(response.statusCode).toBe(404);

        expect(response.body.message)
            .toBe("Url Not Found");
    });


    test("should remove the URL from Redis and pending_clicks when deleted", async () => {
        const timestamp = Date.now();

        const username = `redis_del_${timestamp}`;
        const email = `redis_del_${timestamp}@example.com`;
        const shortCode = nanoid(6);

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const user = await sql`
            SELECT id
            FROM users
            WHERE username = ${username}
        `;

        expect(user).toHaveLength(1);

        const inserted = await sql`
            INSERT INTO urls (
                short_code,
                original_url,
                click_count,
                user_id
            )
            VALUES (
                ${shortCode},
                'https://example.com/redis-delete',
                5,
                ${user[0].id}
            )
            RETURNING id
        `;

        const urlId = inserted[0].id;

        await redis.set(
            shortCode,
            "https://example.com/redis-delete"
        );

        await redis.set(
            `Clicks:${shortCode}`,
            "5"
        );

        await redis.sadd(
            "pending_clicks",
            shortCode
        );

        const response = await agent
            .delete(`/api/urls/${urlId}`);

        expect(response.statusCode).toBe(200);

        const cachedUrl = await redis.get(shortCode);

        expect(cachedUrl).toBeNull();

        const clickCount = await redis.get(`Clicks:${shortCode}`);

        expect(clickCount).toBeNull();

        const pendingClicks = await redis.smembers("pending_clicks");

        expect(pendingClicks).not.toContain(shortCode);
    });

});