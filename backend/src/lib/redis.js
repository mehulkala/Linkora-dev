import { Redis as UpstashRedis } from "@upstash/redis";
import { createClient } from "redis";
import { ENV } from "./env.js";

let redis;
let redisClient;

if (ENV.NODE_ENV === "test") {
    redisClient = createClient({
        url: ENV.REDIS_URL,
    });

    redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err);
    });

    await redisClient.connect();

    redis = {
        get: (key) => redisClient.get(key),

        set: (key, value, options) => {
            if (options?.ex) {
                return redisClient.set(key, value, {
                    EX: options.ex,
                });
            }

            return redisClient.set(key, value);
        },

        incr: (key) => redisClient.incr(key),

        sadd: (key, value) => redisClient.sAdd(key, value),

        srem: (key, value) => redisClient.sRem(key, value),

        smembers: (key) => redisClient.sMembers(key),

        del: (key) => redisClient.del(key),

        ttl: (key) => redisClient.ttl(key),

        eval: (script, keys, args) =>
            redisClient.eval(script, {
                keys,
                arguments: args.map(String),
            }),
    };
} else {
    redis = new UpstashRedis({
        url: ENV.UPSTASH_REDIS_REST_URL,
        token: ENV.UPSTASH_REDIS_REST_TOKEN,
    });
}

export { redis };

export const closeRedis = async () => {
    if (redisClient?.isOpen) {
        await redisClient.quit();
    }
};

export const clearRedis = async () => {
    if (ENV.NODE_ENV === "test" && redisClient?.isOpen) {
        await redisClient.flushDb();
    }
};