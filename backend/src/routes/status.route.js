import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadStatus, getStatuses } from "../controllers/status.controller.js";

const router = express.Router();

router.get("/", protectRoute, getStatuses);
router.post("/", protectRoute, uploadStatus);

export default router;
