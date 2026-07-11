import {nanoid} from "nanoid";
import {sql} from "../lib/db.js";
import { ENV } from "../lib/env.js";

export const generateCode = async (req, res) =>{
    try {
        const {url} = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required",
            });
        }

        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid URL",
            });
        }

        const parsed = new URL(url);
        const myHost = new URL(ENV.BASE_URL);

        if (
            parsed.origin === myHost.origin &&
            parsed.pathname.startsWith("/code/")
        ) {
            return res.status(400).json({
                success: false,
                message: "Cannot shorten an existing Linkora URL.",
            });
        }
        
        // if url is already mapped before then return same short code
        const existingURL = await sql`SELECT short_code FROM urls WHERE original_url=${url}`;
        if(existingURL.length>0){
            return res.status(200).json({
                success: true,
                message: "URL already exists.",
                data: {
                    originalUrl: url,
                    shortCode: existingURL[0].short_code,
                    shortUrl: `${ENV.BASE_URL}/code/${existingURL[0].short_code}`
                }
            });
        }


        // finding unique short code (highly unlikely to loop forever)
        let shortCode;
        let tries = 0;
        const MAX_TRIES = 5;
        for(; tries<MAX_TRIES; tries++){
            shortCode = nanoid(6);
            const exists = await sql`SELECT 1 FROM urls WHERE short_code=${shortCode}`;
            if(exists.length===0) break;
        }
        if(tries===MAX_TRIES){
            throw new Error("Unable to generate a unique code");
        }
        await sql`INSERT INTO urls (short_code, original_url) VALUES (${shortCode}, ${url})`;

        return res.status(201).json({
            success: true,
            message: "Short URL created successfully.",
            data: {
                originalUrl: url,
                shortCode: shortCode,
                shortUrl: `${ENV.BASE_URL}/code/${shortCode}`,
            },
        });
    } catch (error) {
        console.error("Error generating short URL:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}