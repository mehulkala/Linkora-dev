import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import { sql } from "../lib/db.js";

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: "Unauthorized - No token provided"});
        }
        
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded) return res.status(401).json({message: "Unauthorized - Invalid token"});

        const user = await sql`SELECT id, username, email FROM users WHERE id=${decoded.id}`;
        if(user.length === 0) return res.status(401).json({message: "Unauthorized - User not found"});


        req.user = user[0];
        next();
    }catch (error){
        console.log(error);
        return res.status(401).json({
            message: "Unauthorised"
        })
    }
}