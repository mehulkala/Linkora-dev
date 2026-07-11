import {sql} from "../lib/db.js";

export const codeRedirection = async (req, res) => {
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
        return res.redirect(302, result[0].original_url);
    }catch(error){
        console.error("Error redirecting URL:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        })
    }
}