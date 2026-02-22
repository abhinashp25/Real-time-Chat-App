import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({message: "Unauthorized - No token provided"});
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({message: "Unauthorized - Invalid token"});
        }

        const user = await User.findById(decoded.userId).select("-password"); // Exclude password field
        if (!user) {
            return res.status(401).json({message: "User not found"});
        }

        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler
        
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error);
        res.status(500).json({message: "Internal Server error"});
    }

}
