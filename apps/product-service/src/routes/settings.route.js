import { Router } from "express";
import { prisma } from "@repo/product-db";
import { shouldBeUser } from "../middleware/authMiddleware";
const router = Router();
// GET /settings
router.get("/", async (req, res) => {
    try {
        // Find the first settings record, or create default if none exists
        let settings = await prisma.settings.findFirst();
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    storeName: "Xiaomi Store",
                    storeLogo: "/logo.png",
                    storeAddress: "Default Address",
                    currency: "INR",
                    language: "en-IN",
                },
            });
        }
        return res.json(settings);
    }
    catch (error) {
        console.error("Error fetching settings:", error);
        return res.status(500).json({ message: "Failed to fetch settings" });
    }
});
// PUT /settings
router.put("/", shouldBeUser, async (req, res) => {
    try {
        const { storeName, storeLogo, storeAddress, currency, language } = req.body;
        let settings = await prisma.settings.findFirst();
        if (settings) {
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: {
                    storeName,
                    storeLogo,
                    storeAddress,
                    currency,
                    language,
                },
            });
        }
        else {
            settings = await prisma.settings.create({
                data: {
                    storeName,
                    storeLogo,
                    storeAddress,
                    currency,
                    language,
                },
            });
        }
        return res.json(settings);
    }
    catch (error) {
        console.error("Error updating settings:", error);
        return res.status(500).json({ message: "Failed to update settings" });
    }
});
export default router;
