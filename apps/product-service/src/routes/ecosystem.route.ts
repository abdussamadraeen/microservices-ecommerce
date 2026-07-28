import { Router } from "express";
import { getEcosystemConfig, updateEcosystemConfig } from "../controllers/ecosystem.controller.js";
import { shouldBeAdmin } from "../middleware/authMiddleware.js";

const router: Router = Router();

router.get("/", getEcosystemConfig);
router.post("/", shouldBeAdmin, updateEcosystemConfig); // Using POST as upsert

export default router;

