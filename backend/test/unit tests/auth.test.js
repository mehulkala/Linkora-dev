import { beforeEach, expect, jest } from "@jest/globals";

// --------------------
// Mocks
// --------------------

const mockSql = jest.fn();

jest.unstable_mockModule("../../src/lib/db.js", () => ({
    sql: mockSql
}));

const mockBcrypt = {
    compare: jest.fn(),
    hash: jest.fn()
};

jest.unstable_mockModule("bcrypt", () => ({
    default: mockBcrypt
}));

const mockGenerateTokenAndSetCookie = jest.fn();

jest.unstable_mockModule("../../src/lib/jwt.js", () => ({
    generateTokenAndSetCookie: mockGenerateTokenAndSetCookie
}));

const mockValidEmail = jest.fn();

jest.unstable_mockModule("../../src/utils/validators.js", () => ({
    validEmail: mockValidEmail
}));

const {
    loginHandle,
    signupHandle,
    logoutHandle,
    meHandle
} = await import("../../src/controllers/auth.js");


// --------------------
// Tests
// --------------------

describe("loginHandle", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns 400 when credentials are missing", async () => {

        const req = {
            body: {}
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        await loginHandle(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Missing Credentials"
        });

        expect(mockSql).not.toHaveBeenCalled();
    });


    test("returns 401 when user does not exist", async () => {

        const req = {
            body: {
                identifier: "user1",
                password: "password123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockResolvedValueOnce([]);

        await loginHandle(req, res);

        expect(mockSql).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid Credentials"
        });

        expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });


    test("returns 401 when password is incorrect", async () => {

        const req = {
            body: {
                identifier: "user1",
                password: "wrongpassword"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockResolvedValueOnce([
            {
                id: "user1",
                password_hash: "hashedPassword"
            }
        ]);

        mockBcrypt.compare.mockResolvedValueOnce(false);

        await loginHandle(req, res);

        expect(mockBcrypt.compare).toHaveBeenCalledWith(
            "wrongpassword",
            "hashedPassword"
        );

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid Credentials"
        });

        expect(mockGenerateTokenAndSetCookie).not.toHaveBeenCalled();
    });


    test("logs in successfully with correct credentials", async () => {

        const req = {
            body: {
                identifier: "user1",
                password: "password123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockResolvedValueOnce([
            {
                id: "user1",
                password_hash: "hashedPassword"
            }
        ]);

        mockBcrypt.compare.mockResolvedValueOnce(true);

        await loginHandle(req, res);

        expect(mockBcrypt.compare).toHaveBeenCalledWith(
            "password123",
            "hashedPassword"
        );

        expect(mockGenerateTokenAndSetCookie).toHaveBeenCalledWith(
            "user1",
            res
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Login Successful"
        });
    });


    test("returns 500 when login database query fails", async () => {

        const req = {
            body: {
                identifier: "user1",
                password: "password123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockRejectedValueOnce(
            new Error("Database connection failed")
        );

        await loginHandle(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Internal Server Error"
        });
    });
});


// ======================================================
// SIGNUP
// ======================================================

describe("signupHandle", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    test("returns 400 when credentials are missing", async () => {

        const req = {
            body: {}
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        await signupHandle(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Missing Credentials"
        });

        expect(mockValidEmail).not.toHaveBeenCalled();
        expect(mockSql).not.toHaveBeenCalled();
    });


    test("returns 400 when email is invalid", async () => {

        const req = {
            body: {
                username: "user1",
                email: "invalid-email",
                password: "password123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockValidEmail.mockReturnValueOnce(false);

        await signupHandle(req, res);

        expect(mockValidEmail).toHaveBeenCalledWith(
            "invalid-email"
        );

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid email"
        });

        expect(mockSql).not.toHaveBeenCalled();
    });


    test("returns 400 when password is too short", async () => {

        const req = {
            body: {
                username: "user1",
                email: "user@example.com",
                password: "123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockValidEmail.mockReturnValueOnce(true);

        await signupHandle(req, res);

        expect(mockValidEmail).toHaveBeenCalledWith(
            "user@example.com"
        );

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Password should be at least of length 6 or more"
        });

        expect(mockBcrypt.hash).not.toHaveBeenCalled();
        expect(mockSql).not.toHaveBeenCalled();
    });


    test("creates user successfully", async () => {

        const req = {
            body: {
                username: "user1",
                email: "User@Example.com",
                password: "password123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockValidEmail.mockReturnValueOnce(true);

        mockBcrypt.hash.mockResolvedValueOnce(
            "hashedPassword"
        );

        mockSql.mockResolvedValueOnce([
            {
                id: "user1"
            }
        ]);

        await signupHandle(req, res);

        expect(mockValidEmail).toHaveBeenCalledWith(
            "user@example.com"
        );

        expect(mockBcrypt.hash).toHaveBeenCalledWith(
            "password123",
            10
        );

        expect(mockSql).toHaveBeenCalledTimes(1);

        expect(mockGenerateTokenAndSetCookie).toHaveBeenCalledWith(
            "user1",
            res
        );

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            message: "User created successfully"
        });
    });


    test("returns 409 when email already exists", async () => {

        const req = {
            body: {
                username: "user1",
                email: "user@example.com",
                password: "password123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockValidEmail.mockReturnValueOnce(true);

        mockBcrypt.hash.mockResolvedValueOnce(
            "hashedPassword"
        );

        mockSql.mockRejectedValueOnce({
            code: "23505",
            constraint_name: "users_email_key"
        });

        await signupHandle(req, res);

        expect(res.status).toHaveBeenCalledWith(409);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email already exists"
        });

        expect(mockGenerateTokenAndSetCookie).not.toHaveBeenCalled();
    });


    test("returns 409 when username already exists", async () => {

        const req = {
            body: {
                username: "user1",
                email: "user@example.com",
                password: "password123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockValidEmail.mockReturnValueOnce(true);

        mockBcrypt.hash.mockResolvedValueOnce(
            "hashedPassword"
        );

        mockSql.mockRejectedValueOnce({
            code: "23505",
            constraint_name: "users_username_key"
        });

        await signupHandle(req, res);

        expect(res.status).toHaveBeenCalledWith(409);

        expect(res.json).toHaveBeenCalledWith({
            message: "Username already exists"
        });
    });


    test("returns 500 when signup database operation fails", async () => {

        const req = {
            body: {
                username: "user1",
                email: "user@example.com",
                password: "password123"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockValidEmail.mockReturnValueOnce(true);

        mockBcrypt.hash.mockResolvedValueOnce(
            "hashedPassword"
        );

        mockSql.mockRejectedValueOnce(
            new Error("Database connection failed")
        );

        await signupHandle(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Internal Server Error"
        });
    });
});


// ======================================================
// LOGOUT
// ======================================================

describe("logoutHandle", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    test("logs out successfully", async () => {

        const req = {};

        const res = {
            clearCookie: jest.fn(),
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        await logoutHandle(req, res);

        expect(res.clearCookie).toHaveBeenCalledWith(
            "jwt",
            {
                path: "/"
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Logged Out Successfully"
        });
    });
});


// ======================================================
// ME
// ======================================================

describe("meHandle", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    test("returns authenticated user", async () => {

        const req = {
            user: {
                id: "user1",
                username: "mehul"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        await meHandle(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            user: req.user
        });
    });
});