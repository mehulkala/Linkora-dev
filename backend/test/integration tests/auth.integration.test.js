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

describe("POST /api/auth/signup", () => {
    test("should create a new user in the database", async () => {
        const timestamp = Date.now();

        const username = `integration_test_${timestamp}`;
        const email = `integration_test_${timestamp}@example.com`;

        const response = await request(app)
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(response.statusCode).toBe(201);

        // Verify the user was actually created in PostgreSQL
        const users = await sql`
            SELECT username, email
            FROM users
            WHERE username = ${username}
        `;

        expect(users).toHaveLength(1);
        expect(users[0].username).toBe(username);
        expect(users[0].email).toBe(email);
    });

    test("should reject duplicate username", async () => {
        const timestamp = Date.now();

        const username = `duplicate_test_${timestamp}`;
        const email1 = `duplicate1_${timestamp}@example.com`;
        const email2 = `duplicate2_${timestamp}@example.com`;

        // First signup
        const firstResponse = await request(app)
            .post("/api/auth/signup")
            .send({
                username,
                email: email1,
                password: "Password123!"
            });

        expect(firstResponse.statusCode).toBe(201);

        // Second signup with the same username
        const secondResponse = await request(app)
            .post("/api/auth/signup")
            .send({
                username,
                email: email2,
                password: "Password123!"
            });

        expect(secondResponse.statusCode).toBe(409);
    });

    test("should reject duplicate email", async () => {
        const timestamp = Date.now();

        const username1 = `email_test_1_${timestamp}`;
        const username2 = `email_test_2_${timestamp}`;
        const email = `email_test_${timestamp}@example.com`;

        const firstResponse = await request(app)
            .post("/api/auth/signup")
            .send({
                username: username1,
                email,
                password: "Password123!"
            });

        expect(firstResponse.statusCode).toBe(201);

        const secondResponse = await request(app)
            .post("/api/auth/signup")
            .send({
                username: username2,
                email,
                password: "Password123!"
            });

        expect(secondResponse.statusCode).toBe(409);
    });    
});

describe("POST /api/auth/login", ()=>{
    test("should login an existing user", async () => {
        const timestamp = Date.now();

        const username = `login_test_${timestamp}`;
        const email = `login_test_${timestamp}@example.com`;
        const password = "Password123!";

        // Create the user first
        const signupResponse = await request(app)
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password
            });

        expect(signupResponse.statusCode).toBe(201);

        // Login with the same credentials
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                identifier : email,
                password
            });

        expect(loginResponse.statusCode).toBe(200);
    });

    test("should reject login with wrong password", async () => {
        const timestamp = Date.now();

        const username = `wrong_password_${timestamp}`;
        const email = `wrong_password_${timestamp}@example.com`;

        const signupResponse = await request(app)
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password: "Password123!"
            });

        expect(signupResponse.statusCode).toBe(201);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                identifier: email,
                password: "WrongPassword123!"
            });

        expect(loginResponse.statusCode).toBe(401);
    });

    test("should reject login with nonexistent user", async () => {
        const timestamp = Date.now();

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                identifier: `does_not_exist_${timestamp}@example.com`,
                password: "Password123!"
            });

        expect(loginResponse.statusCode).toBe(401);
    });
});

describe("GET /api/auth/me", ()=>{
    test("should access protected route with valid JWT", async () => {
        const timestamp = Date.now();

        const username = `protected_${timestamp}`;
        const email = `protected_${timestamp}@example.com`;
        const password = "Password123!";

        const agent = request.agent(app);

        const signupResponse = await agent
            .post("/api/auth/signup")
            .send({
                username,
                email,
                password
            });

        expect(signupResponse.statusCode).toBe(201);

        const meResponse = await agent
            .get("/api/auth/me");

        expect(meResponse.statusCode).toBe(200);
        expect(meResponse.body.user.username).toBe(username);
        expect(meResponse.body.user.email).toBe(email);
    });

    test("should reject access to protected route without JWT", async () => {
        const response = await request(app)
            .get("/api/auth/me");

        expect(response.statusCode).toBe(401);
    });
});