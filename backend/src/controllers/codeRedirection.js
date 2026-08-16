import {sql} from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { ENV } from "../lib/env.js";

export const codeRedirection = async (req, res) => {
    //check in the redis database for the shortCode and then try to check for the database
    // if not present in redis

    try{
        const {id: shortCode} = req.params;

        const original_url = await redis.get(shortCode);
        if(original_url){
            console.log(`Cache HIT: ${shortCode}`)
            const count = await redis.incr(`Clicks:${shortCode}`);
            await redis.sadd('pending_clicks', shortCode);
            return res.redirect(302, original_url);
        }
        console.log(`Cache MISS: ${shortCode}`);
    }catch(error){
        console.log("Error querying the redis database");
        console.log(error.message);
    }


    //check if the database has this id or not
    // if present then redirect else tell that this is invalid shortUrl/shortCode
    try{
        console.log(req.params);
        const {id: shortCode} = req.params;
        console.log(shortCode);
        const query = await sql`SELECT original_url, expires_at FROM urls WHERE short_code=${shortCode}`;
        if(query.length === 0){
            return res.status(404).json({
                message: "No matching url found"
            })
        }

        const {original_url, expires_at} = query[0];
        if(expires_at && new Date() >= new Date(expires_at)){
            return res.redirect(302, `${ENV.CLIENT_URL}/expired`);
        }

        const result = await sql`UPDATE urls SET click_count = click_count + 1 WHERE short_code = ${shortCode}`;

        // adding the key value pair for the url into the redis databse
        if(expires_at){
            const ttl = Math.ceil((new Date(expires_at).getTime()- Date.now())/1000);
            if(ttl>0){
                await redis.set(shortCode, original_url, {ex: ttl});
            }
        }else{
            await redis.set(shortCode, original_url);
        }

        return res.redirect(302, original_url);
    }catch(error){
        console.error("Error redirecting URL:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        })
    }
}