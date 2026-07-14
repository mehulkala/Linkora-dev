import {sql} from "../lib/db.js";
import { redis } from "../lib/redis.js";

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
        const result = await sql`UPDATE urls SET click_count = click_count + 1 WHERE short_code = ${shortCode} RETURNING original_url`;
        if(result.length === 0){
            return res.status(404).json({
                success: false,
                error: "No matching url found"
            });
        }

        // adding the key value pair for the url into the redis databse
        await redis.set(shortCode, result[0].original_url);

        return res.redirect(302, result[0].original_url);
    }catch(error){
        console.error("Error redirecting URL:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        })
    }
}