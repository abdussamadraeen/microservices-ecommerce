import express from "express";
import { createBanner, deleteBanner, getBanners, updateBanner, } from "../controllers/banner.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";
const router = express.Router();
router.get("/", getBanners);
router.post("/", shouldBeAdmin, createBanner);
router.put("/:id", shouldBeAdmin, updateBanner);
router.delete("/:id", shouldBeAdmin, deleteBanner);
export default router;
