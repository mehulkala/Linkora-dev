import { redis } from "../lib/redis.js";
export const rateLimiter = ({limit, window}) =>{

    return async (req, res, next) => {
        const ip = req.ip;
        const key = `rate-limit:${ip}:${req.path}`
        const count  = await redis.eval(`
            local count = redis.call("INCR", KEYS[1])

            if count == 1 then
                redis.call("EXPIRE", KEYS[1], ARGV[1])
            end
            
            return count
            `,
            [key],
            [window]
        )
        
        if(count>limit){
            return res.status(429).json({
                message: "Too many requests. Please try again later!"
            })
        }
    
        next();
    }
}