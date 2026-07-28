
import { prisma } from "@repo/product-db";

export async function getSettings() {
    try {
        // Find the first settings record or create default
        const settings = await prisma.settings.findFirst();

        if (!settings) {
            return null;
        }

        return settings;
    } catch (error) {
        console.warn("Failed to fetch settings (likely during build):", error);
        return null;
    }
}
