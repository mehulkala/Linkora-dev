import { beforeEach, expect, jest } from "@jest/globals";
import { ENV } from "../../src/lib/env.js";

const mockSql = jest.fn();

const mockRedis = {
    del: jest.fn(),
    srem: jest.fn()
};

jest.unstable_mockModule("../../src/lib/db.js", () => ({
    sql: mockSql
}));

jest.unstable_mockModule("../../src/lib/redis.js", () => ({
    redis: mockRedis
}));

const { dashboard, deleteUrl } = await import("../../src/controllers/dashboard.js");

describe("dashboard", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("fetches dashboard data successfully", async () => {
        const req = {
            user: {
                id: "user1"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql
            .mockResolvedValueOnce([{
                total_clicks: "100",
                total_urls: "10",
                active_urls: "8"
            }])
            .mockResolvedValueOnce([
                {
                    id: 1,
                    short_code: "abc123",
                    original_url: "https://example.com",
                    click_count: 50,
                    created_at: "2026-01-01",
                    expires_at: null
                },
                {
                    id: 2,
                    short_code: "xyz789",
                    original_url: "https://google.com",
                    click_count: 50,
                    created_at: "2026-01-02",
                    expires_at: null
                }
            ]);

        await dashboard(req, res);

        expect(mockSql).toHaveBeenCalledTimes(2);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Data Fetched Successfully",
            data: {
                stats: {
                    totalClicks: 100,
                    totalUrls: 10,
                    averageClicks: 10,
                    activeUrls: 8
                },
                urls: [
                    {
                        id: 1,
                        short_code: "abc123",
                        original_url: "https://example.com",
                        click_count: 50,
                        created_at: "2026-01-01",
                        expires_at: null,
                        shortUrl: `${ENV.BASE_URL}/code/abc123`
                    },
                    {
                        id: 2,
                        short_code: "xyz789",
                        original_url: "https://google.com",
                        click_count: 50,
                        created_at: "2026-01-02",
                        expires_at: null,
                        shortUrl: `${ENV.BASE_URL}/code/xyz789`
                    }
                ]
            }
        });
    });

    test("returns zero average clicks when there are no URLs", async () => {
        const req = {
            user: {
                id: "user1"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql
            .mockResolvedValueOnce([{
                total_clicks: "0",
                total_urls: "0",
                active_urls: "0"
            }])
            .mockResolvedValueOnce([]);

        await dashboard(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Data Fetched Successfully",
            data: {
                stats: {
                    totalClicks: 0,
                    totalUrls: 0,
                    averageClicks: 0,
                    activeUrls: 0
                },
                urls: []
            }
        });
    });

    test("returns 500 when database query fails", async () => {
        const req = {
            user: {
                id: "user1"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockRejectedValue(new Error("Database error"));

        await dashboard(req, res);

        expect(mockSql).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Internal Server Error"
        });
    });
});


describe("deleteUrl", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("deletes URL successfully", async () => {
        const req = {
            params: {
                id: "url1"
            },
            user: {
                id: "user1"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockResolvedValue({
            count: 1,
            0: {
                short_code: "abc123"
            }
        });

        mockRedis.del.mockResolvedValue(1);
        mockRedis.srem.mockResolvedValue(1);

        await deleteUrl(req, res);

        expect(mockSql).toHaveBeenCalled();

        expect(mockRedis.del).toHaveBeenNthCalledWith(
            1,
            "Clicks:abc123"
        );

        expect(mockRedis.del).toHaveBeenNthCalledWith(
            2,
            "abc123"
        );

        expect(mockRedis.srem).toHaveBeenCalledWith(
            "pending_clicks",
            "abc123"
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Url deleted successfully"
        });
    });

    test("returns 404 when URL does not exist", async () => {
        const req = {
            params: {
                id: "url1"
            },
            user: {
                id: "user1"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockResolvedValue({
            count: 0
        });

        await deleteUrl(req, res);

        expect(mockSql).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "Url Not Found"
        });

        expect(mockRedis.del).not.toHaveBeenCalled();
        expect(mockRedis.srem).not.toHaveBeenCalled();
    });

    test("returns 500 when database deletion fails", async () => {
        const req = {
            params: {
                id: "url1"
            },
            user: {
                id: "user1"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockRejectedValue(new Error("Database error"));

        await deleteUrl(req, res);

        expect(mockSql).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Internal Server Error"
        });

        expect(mockRedis.del).not.toHaveBeenCalled();
        expect(mockRedis.srem).not.toHaveBeenCalled();
    });

    test("returns 500 when Redis deletion fails", async () => {
        const req = {
            params: {
                id: "url1"
            },
            user: {
                id: "user1"
            }
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        res.status.mockReturnValue(res);

        mockSql.mockResolvedValue({
            count: 1,
            0: {
                short_code: "abc123"
            }
        });

        mockRedis.del.mockRejectedValue(new Error("Redis error"));

        await deleteUrl(req, res);

        expect(mockSql).toHaveBeenCalled();

        expect(mockRedis.del).toHaveBeenCalledWith(
            "Clicks:abc123"
        );

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Internal Server Error"
        });
    });

});