import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { generalRateLimit, uploadRateLimit } from "../middleware/arcjet.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { uploadStatusSchema } from "../schemas/validation.schemas.js";
import { uploadStatus, getStatuses, deleteStatus } from "../controllers/status.controller.js";

const router = express.Router();

router.get("/", generalRateLimit, protectRoute, getStatuses);
router.post("/", generalRateLimit, uploadRateLimit, protectRoute, validateSchema(uploadStatusSchema), uploadStatus);
router.delete("/:id", generalRateLimit, protectRoute, deleteStatus);

export default router;
