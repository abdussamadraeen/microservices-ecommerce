import express from "express";
import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
} from "../controllers/banner.controller.js";
import { shouldBeAdmin } from "../middleware/authMiddleware.js";

const router: express.Router = express.Router();

router.get("/", getBanners);
router.post("/", shouldBeAdmin, createBanner);
router.put("/:id", shouldBeAdmin, updateBanner);
router.delete("/:id", shouldBeAdmin, deleteBanner);

export default router;

