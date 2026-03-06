import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
const router = express.Router();

router.use(arcjetProtection);


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

// FIX: was returning { message: "Authenticated", user: req.user }
// useAuthStore.checkAuth sets authUser = res.data directly, so return user directly
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router;

