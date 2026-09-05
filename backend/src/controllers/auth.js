import { sql } from "../lib/db.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../lib/jwt.js";
import { validEmail } from "../utils/validators.js";

const saltRounds = 10;

export const loginHandle = async (req, res) =>{
    try{
        const identifier = req.body.identifier?.trim();
        const password = req.body.password;
        
        if(!identifier || !password){
            return res.status(400).json({
                message: "Missing Credentials"
            })
        }
        const query = await sql`SELECT id, password_hash FROM users WHERE username=${identifier} OR email=${identifier}`;
    
        if(query.length === 0){
            // user does not exists
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }
    
        const hashPassword = query[0].password_hash;
    
        const isPasswordCorrect = await bcrypt.compare(password, hashPassword);
    
        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }
    
        // generate jwt token and set cookie
        generateTokenAndSetCookie(query[0].id, res);
    
        return res.status(200).json({
            message: "Login Successful",
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const signupHandle = async (req, res) =>{
    try {
        
        // check if user already exists
        // if yes then simply check for password and generate the jwt token if required 
        // else create a entry in users table and then generate a jwt token
        
        const username = req.body.username?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if(!username || !email || !password){
            return res.status(400).json({
                message: "Missing Credentials"
            })
        }
        
        // check if a email is valid
        if(!validEmail(email)) return res.status(400).json({
            message: "Invalid email"
        })
        
        // check if password is of atleast 6 chars long
        if(password.length < 6) return res.status(400).json({
            message: "Password should be at least of length 6 or more"
        })
        
        // hash the password
        const password_hash = await bcrypt.hash(password, saltRounds);
        
        // store in database
        const query = await sql`INSERT INTO users (username, email, password_hash) VALUES (${username}, ${email}, ${password_hash}) RETURNING id`;
        
        // generate token and set cookie
        generateTokenAndSetCookie(query[0].id, res);
        
        // return 
        return res.status(201).json({
            message: "User created successfully"
        })

    } catch (error) {
        if(error.code === "23505"){
            if(error.constraint_name === "users_email_key"){
                return res.status(409).json({
                    message: "Email already exists"
                })
            }
            
            if(error.constraint_name === "users_username_key"){
                return res.status(409).json({
                    message: "Username already exists"
                })
            }
        }
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const logoutHandle = async (req, res) =>{
    res.clearCookie("jwt",{
        path: "/"
    });

    return res.status(200).json({
        message: "Logged Out Successfully"
    })
}

export const meHandle = async (req, res) => {
    return res.status(200).json({
        user: req.user,
    })
}