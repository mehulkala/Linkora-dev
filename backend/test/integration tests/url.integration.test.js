import request from "supertest";
import app from "../../src/app.js";
import { sql } from "../../src/lib/db.js";
import { closeRedis, clearRedis } from "../../src/lib/redis.js";

beforeEach(async () => {
    await clearRedis();
});

afterAll(async () => {
    await sql.end();
    await closeRedis();
});


describe("POST /api/generate-code", () => {

    test("should create a short URL for an authenticated user", async () => {
        const timestamp = Date.now();

        const username = `url_create_${timestamp}`;
        const email = `url_create_${timestamp}@example.com`;
        const url = `https://example.com/${timestamp}`;

        const agent = request.agent(app);

        // Signup and establish authentication
        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        // Create short URL
        const response = await agent
            .post("/api/generate-code")
            .send({
                url,
                expiration: "1d"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.originalUrl).toBe(url);
        expect(response.body.data.shortCode).toBeTruthy();
        expect(response.body.data.shortUrl).toContain(
            `/code/${response.body.data.shortCode}`
        );
    });


    test("should reject URL creation without authentication", async () => {
        const response = await request(app)
            .post("/api/generate-code")
            .send({
                url: "https://example.com",
                expiration: "1d"
            });

        expect(response.statusCode).toBe(401);
    });


    test("should reject request when URL is missing", async () => {
        const timestamp = Date.now();

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username: `missing_url_${timestamp}`,
                email: `missing_url_${timestamp}@example.com`,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const response = await agent
            .post("/api/generate-code")
            .send({
                expiration: "1d"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("URL is required");
    });


    test("should reject an invalid URL", async () => {
        const timestamp = Date.now();

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username: `invalid_url_${timestamp}`,
                email: `invalid_url_${timestamp}@example.com`,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const response = await agent
            .post("/api/generate-code")
            .send({
                url: "not-a-valid-url",
                expiration: "1d"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid URL");
    });


    test("should reject an invalid expiration option", async () => {
        const timestamp = Date.now();

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username: `invalid_exp_${timestamp}`,
                email: `invalid_exp_${timestamp}@example.com`,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const response = await agent
            .post("/api/generate-code")
            .send({
                url: "https://example.com",
                expiration: "2h"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid expiration option");
    });


    test("should store the created URL in the database with the correct user", async () => {
        const timestamp = Date.now();

        const username = `db_url_${timestamp}`;
        const email = `db_url_${timestamp}@example.com`;
        const url = `https://example.com/db-test-${timestamp}`;

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
            .post("/api/generate-code")
            .send({
                url,
                expiration: "1d"
            });

        expect(response.statusCode).toBe(201);

        const rows = await sql`
            SELECT
                urls.original_url,
                urls.short_code,
                urls.user_id,
                users.username,
                urls.click_count
            FROM urls
            JOIN users ON users.id = urls.user_id
            WHERE urls.original_url = ${url}
        `;

        expect(rows).toHaveLength(1);

        expect(rows[0].original_url).toBe(url);
        expect(rows[0].short_code).toBe(response.body.data.shortCode);
        expect(rows[0].username).toBe(username);
        expect(Number(rows[0].click_count)).toBe(0);
    });


    test("should return the existing short code when the same URL is created again by the same user", async () => {
        const timestamp = Date.now();

        const username = `duplicate_url_${timestamp}`;
        const email = `duplicate_url_${timestamp}@example.com`;
        const url = `https://example.com/duplicate-${timestamp}`;

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const firstResponse = await agent
            .post("/api/generate-code")
            .send({
                url,
                expiration: "1d"
            });

        expect(firstResponse.statusCode).toBe(201);

        const secondResponse = await agent
            .post("/api/generate-code")
            .send({
                url,
                expiration: "1d"
            });

        expect(secondResponse.statusCode).toBe(200);

        expect(secondResponse.body.message).toBe("URL already exists.");

        expect(secondResponse.body.data.shortCode)
            .toBe(firstResponse.body.data.shortCode);
    });


    test("should reject shortening an existing Linkora URL", async () => {
        const timestamp = Date.now();

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username: `linkora_url_${timestamp}`,
                email: `linkora_url_${timestamp}@example.com`,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const response = await agent
            .post("/api/generate-code")
            .send({
                url: `http://localhost:3000/code/abc123`,
                expiration: "1d"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message)
            .toBe("Cannot shorten an existing Linkora URL.");
    });


    test("should create a URL with no expiration when expiration is 'never'", async () => {
        const timestamp = Date.now();

        const username = `never_exp_${timestamp}`;
        const email = `never_exp_${timestamp}@example.com`;
        const url = `https://example.com/never-${timestamp}`;

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
            .post("/api/generate-code")
            .send({
                url,
                expiration: "never"
            });

        expect(response.statusCode).toBe(201);

        const rows = await sql`
            SELECT expires_at
            FROM urls
            WHERE short_code = ${response.body.data.shortCode}
        `;

        expect(rows).toHaveLength(1);
        expect(rows[0].expires_at).toBeNull();
    });

});