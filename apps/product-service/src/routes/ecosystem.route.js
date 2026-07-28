import { Router } from "express";
import { getEcosystemConfig, updateEcosystemConfig } from "../controllers/ecosystem.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";
const router = Router();
router.get("/", getEcosystemConfig);
router.post("/", shouldBeAdmin, updateEcosystemConfig); // Using POST as upsert
export default router;
