import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export function generateTokenAndSetCookie(userId, res){
    // generate token
    const token = jwt.sign(
        {
            id: userId,
        },
        ENV.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    )
    
    // set cookie
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7*24*60*60*1000,
        path: "/"
    })
}