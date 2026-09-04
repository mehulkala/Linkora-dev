import {beforeEach, expect, jest} from "@jest/globals";
import { ENV } from "../../src/lib/env.js";


const mockSql = jest.fn();
jest.unstable_mockModule("../../src/lib/db.js", ()=>({
    sql: mockSql
}))

const mockNanoid = jest.fn();
jest.unstable_mockModule("nanoid", ()=>({
    nanoid: mockNanoid
}))

const {generateCode} = await import("../../src/controllers/generateCode.js");

describe("generateCode", ()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
    })

    test("missing URL", async()=>{
        const req = {
            body: {
                expiration: "7d"
            }
        }

        const res = {
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res)

        await generateCode(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "URL is required"
        });
    })
    
    test("Invalid URL", async ()=>{
        const req = {
            body: {
                url:"jksjfdlsjldkf",
                expiration: "7d"
            }
        }

        const res = {
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res);

        await generateCode(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid URL"
        })
    })

    test("Invalid expiration", async ()=>{
        const req = {
            body: {
                url:"https://example.com",
                expiration: "10 days"
            }
        }

        const res = {
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res);

        await generateCode(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid expiration option"
        })
    })

    test("Unauthenticated User", async () =>{
        const req = {
            body: {
                url:"https://example.com",
                expiration: "7d"
            }
        }

        const res = {
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res);

        await generateCode(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorised"
        })
    })

    test("Linkora URL rejection", async ()=>{
        const req = {
            user:{
                id: "user1"
            },
            body: {
                url: `${ENV.BASE_URL}/code/abc1234`,
                expiration: "7d"
            }
        }

        const res = {
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res);

        await generateCode(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Cannot shorten an existing Linkora URL."
        })
    })

    test("Existing URL in DB", async () =>{
        const req = {
            user:{
                id: "user1"
            },
            body: {
                url: "https://example.com",
                expiration: "7d"
            }
        }

        const res = {
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res);

        mockSql.mockResolvedValue([{short_code: "abc1234"}])

        await generateCode(req, res);

        expect(mockSql).toHaveBeenCalled();
        expect(mockNanoid).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success:true, 
            message: "URL already exists.",
            data: {
                originalUrl : "https://example.com",
                shortCode : "abc1234",
                shortUrl: `${ENV.BASE_URL}/code/abc1234`
            }
        })
    })

    test("creates a new short URL successfully", async ()=>{
        const req = {
            user:{
                id: "user1"
            },
            body: {
                url: "https://example.com",
                expiration: "7d"
            }
        }

        const res = {
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res);

        mockSql.mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

        mockNanoid.mockReturnValue("abc1234");

        await generateCode(req, res);

        expect(mockSql).toHaveBeenCalledTimes(3);

        console.log("SQL calls:", mockSql.mock.calls.length);
        console.log("SQL results configured for 3 calls");

        expect(mockNanoid).toHaveBeenCalledWith(6);

        expect(res.status).toHaveBeenCalledWith(201);
        
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Short URL created successfully.",
            data: {
                originalUrl: "https://example.com",
                shortCode: "abc1234",
                shortUrl: `${ENV.BASE_URL}/code/abc1234`
            }
        })

    })

    test("retries when generated short code already exists", async () => {
        const req = {
            user: {
                id: "user1"
            },
            body: {
                url: "https://example.com",
                expiration: "7d"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockNanoid
            .mockReturnValueOnce("abc123")
            .mockReturnValueOnce("xyz789");

        mockSql
            .mockResolvedValueOnce([])     
            .mockResolvedValueOnce([{}])   
            .mockResolvedValueOnce([])     
            .mockResolvedValueOnce([]);    

        await generateCode(req, res);

        expect(mockNanoid).toHaveBeenCalledTimes(2);

        expect(mockNanoid).toHaveBeenNthCalledWith(1, 6);
        expect(mockNanoid).toHaveBeenNthCalledWith(2, 6);

        expect(mockSql).toHaveBeenCalledTimes(4);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Short URL created successfully.",
            data: {
                originalUrl: "https://example.com",
                shortCode: "xyz789",
                shortUrl: `${ENV.BASE_URL}/code/xyz789`
            }
        });
    });

    test("returns 500 when unable to generate a unique short code", async () => {
        const req = {
            user: {
                id: "user1"
            },
            body: {
                url: "https://example.com",
                expiration: "7d"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockNanoid
            .mockReturnValueOnce("abc123")
            .mockReturnValueOnce("def456")
            .mockReturnValueOnce("ghi789")
            .mockReturnValueOnce("jkl012")
            .mockReturnValueOnce("mno345");

        mockSql
            .mockResolvedValueOnce([])     // URL doesn't already exist
            .mockResolvedValueOnce([{}])   // attempt 1 collision
            .mockResolvedValueOnce([{}])   // attempt 2 collision
            .mockResolvedValueOnce([{}])   // attempt 3 collision
            .mockResolvedValueOnce([{}])   // attempt 4 collision
            .mockResolvedValueOnce([{}]);  // attempt 5 collision

        await generateCode(req, res);

        expect(mockNanoid).toHaveBeenCalledTimes(5);
        expect(mockSql).toHaveBeenCalledTimes(6);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Internal Server Error"
        });
    });

    test("returns 500 when database query fails", async () => {
        const req = {
            user: {
                id: "user1"
            },
            body: {
                url: "https://example.com",
                expiration: "7d"
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

        await generateCode(req, res);

        expect(mockSql).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Internal Server Error"
        });
    });
})
