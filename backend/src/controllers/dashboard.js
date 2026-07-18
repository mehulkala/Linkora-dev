import { sql } from "../lib/db.js";
import { ENV } from "../lib/env.js";

export const dashboard = async(req, res) => {
    try {
        const userId = req.user.id;
        const stats = await sql`SELECT COUNT(*) total_urls, COALESCE(SUM(click_count), 0) total_clicks FROM urls WHERE user_id=${userId}`;
        const urls = await sql`SELECT id, short_code, original_url, click_count, created_at FROM urls WHERE user_id=${userId} ORDER BY created_at DESC`;
        const totalClicks = Number(stats[0].total_clicks);
        const totalUrls = Number(stats[0].total_urls);

        const averageClicks = totalUrls===0? 0 : Math.round(totalClicks/totalUrls);
        const activeUrls = totalUrls;

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