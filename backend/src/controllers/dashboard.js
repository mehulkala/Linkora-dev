import { sql } from "../lib/db.js";
import { ENV } from "../lib/env.js";
import { redis } from "../lib/redis.js";

export const dashboard = async(req, res) => {
    try {
        const userId = req.user.id;
        const stats = await sql`
    SELECT
        COUNT(*) AS total_urls,
        COUNT(*) FILTER (
            WHERE expires_at IS NULL OR expires_at > NOW()
        ) AS active_urls,
        COALESCE(SUM(click_count), 0) AS total_clicks
    FROM urls
    WHERE user_id=${userId}
`;
        const urls = await sql`SELECT id, short_code, original_url, click_count, created_at, expires_at FROM urls WHERE user_id=${userId} ORDER BY created_at DESC`;
        const totalClicks = Number(stats[0].total_clicks);
        const totalUrls = Number(stats[0].total_urls);
        const activeUrls = Number(stats[0].active_urls);

        const averageClicks = totalUrls === 0
            ? 0
            : Math.round(totalClicks / totalUrls);

        const formattedUrls = urls.map(url=>({
            ...url,
            shortUrl: `${ENV.BASE_URL}/code/${url.short_code}`
        }))

        return res.status(200).json({
            message: "Data Fetched Successfully",
            data: {
                stats: {
                    totalClicks: totalClicks,
                    totalUrls: totalUrls,
                    averageClicks: averageClicks,
                    activeUrls: activeUrls,
                },
                urls: formattedUrls
            }
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const deleteUrl = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user.id;

        
        // delete it from the database 
        const result = await sql`DELETE from urls WHERE user_id=${userId} AND id=${id} RETURNING short_code`
        
        if(result.count === 0){
            return res.status(404).json({
                message: "Url Not Found"
            })
        }
        
        // delete it from redis if there exists one
        await redis.del(`Clicks:${result[0].short_code}`)
        await redis.del(`${result[0].short_code}`)
        await redis.srem('pending_clicks', result[0].short_code);

        return res.status(200).json({
            message: "Url deleted successfully"
        })
    }catch (error){
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}