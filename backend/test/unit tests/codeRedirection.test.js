import {expect, jest} from "@jest/globals";
import { ENV } from "../../src/lib/env.js";

const mockRedis = {
    get: jest.fn(),
    incr: jest.fn(),
    sadd: jest.fn(),
    set: jest.fn()
};

const mockSql = jest.fn();

jest.unstable_mockModule("../../src/lib/redis.js", ()=>({
    redis: mockRedis
}));

jest.unstable_mockModule("../../src/lib/db.js", ()=> ({
    sql: mockSql
}));


const {codeRedirection} = await import("../../src/controllers/codeRedirection.js");

describe("codeRedirection", ()=>{

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("redirects to URL when found in Redis", async ()=>{
        const req = {
            params: {
                id: 'abc1234'
            }
        };

        const res = {
            redirect: jest.fn(),
            status: jest.fn(),
            json: jest.fn()
        }

        mockRedis.get.mockResolvedValue("https://example.com");
        mockRedis.incr.mockResolvedValue(1);
        mockRedis.sadd.mockResolvedValue(1);

        await codeRedirection(req, res);

        expect(mockRedis.get).toHaveBeenCalledWith("abc1234");

        expect(mockRedis.incr).toHaveBeenCalledWith("Clicks:abc1234");
        expect(mockRedis.sadd).toHaveBeenCalledWith("pending_clicks", "abc1234");
        expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com");
        expect(mockSql).not.toHaveBeenCalled();

    })

    test("redirects the URL when redis miss and DB HIT", async ()=>{
        const req = {
            params:{
                id: "abc1234"
            }
        }

        const res = {
            redirect: jest.fn(),
            status: jest.fn(),
            json: jest.fn()
        }

        mockRedis.get.mockResolvedValue(null);

        mockSql.mockResolvedValue([{
            original_url: "https://example.com",
            expires_at: null
        }])

        await codeRedirection(req, res);

        expect(mockRedis.get).toHaveBeenCalledWith("abc1234");
        expect(mockSql).toHaveBeenCalled();

        expect(mockRedis.set).toHaveBeenCalledWith("abc1234", "https://example.com");
        expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com");
    })

    test("returns 404 when short code is not found", async () => {
        //arrange
        const req = {
            params: {
                id: "abc1234"
            }
        }

        const res = {
            redirect: jest.fn(),
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res);

        mockRedis.get.mockResolvedValue(null)

        mockSql.mockResolvedValue([]);

        //act
        await codeRedirection(req, res);

        //assert
        expect(mockRedis.get).toHaveBeenCalledWith("abc1234");

        expect(mockSql).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({message:"No matching url found"});
    })

    test("expired urls check for validity", async ()=>{
        const req = {
            params: {
                id: "abc1234"
            }
        }

        const res = {
            redirect: jest.fn(),
            status: jest.fn(),
            json: jest.fn()
        }

        mockRedis.get.mockResolvedValue(null);

        mockSql.mockResolvedValue([{
            original_url: "https://example.com",
            expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }])

        await codeRedirection(req, res);

        expect(mockRedis.get).toHaveBeenCalledWith("abc1234");

        expect(mockSql).toHaveBeenCalled();

        expect(res.redirect).toHaveBeenCalledWith(302, `${ENV.CLIENT_URL}/expired`);
    })

    test("returns 500 when database query fails", async ()=>{
        const req = {
            params:{
                id: "abc1234"
            }
        }

        const res = {
            redirect: jest.fn(),
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res);

        mockRedis.get.mockResolvedValue(null);

        mockSql.mockRejectedValue(new Error("Database connection failed"))

        await codeRedirection(req, res);

        expect(mockRedis.get).toHaveBeenCalledWith("abc1234");

        expect(mockSql).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Internal Server Error"
        })
    })

    test("fall back to database when redis fails", async ()=>{
        const req = {
            params: {
                id: "abc1234"
            }
        }

        const res = {
            redirect: jest.fn(),
            status: jest.fn(),
            json: jest.fn()
        }

        mockRedis.get.mockRejectedValue(new Error("Error querying the redis database"));

        mockSql.mockResolvedValue([{
            original_url: "https://example.com",
            expires_at: null
        }])

        await codeRedirection(req, res);

        expect(mockRedis.get).toHaveBeenCalledWith("abc1234");

        expect(mockSql).toHaveBeenCalled();

        expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com")
    })
})