
import fetch from "node-fetch";

const PRODUCT_SERVICE_URL = "http://localhost:8000";
const HERO_PRODUCT_ID = 68;

async function main() {
    console.log(`Updating Hero Product to ID: ${HERO_PRODUCT_ID}...`);

    try {
        // 1. Get current config
        console.log("Fetching current configuration...");
        const res = await fetch(`${PRODUCT_SERVICE_URL}/ecosystem`);
        let currentConfig: any = {};
        if (res.ok) {
            currentConfig = await res.json();
        }

        // 2. Prepare payload
        // Preserve existing title/subtitle/sideProducts if they exist, otherwise use defaults
        const payload = {
            title: currentConfig.title || "The Xiaomi Ecosystem.",
            subtitle: currentConfig.subtitle || "Seamlessly connected. Beautifully designed.",
            heroProductId: HERO_PRODUCT_ID,
            subProductIds: currentConfig.subProductIds || []
        };

        // 3. Send Update
        // Note: The /ecosystem endpoint expects a POST request and requires admin privileges.
        // However, for this script running locally, we might need a way to bypass auth or use a token.
        // Checking the codebase, the 'seed' script usually accesses DB directly.
        // BUT, my plan said "update via script", and since I don't have a token easily, 
        // I should probably just use Prisma directly like the seed script if I can.
        // authenticating as admin via script is hard without a medical token.

        // Let's try to use Prisma directly instead, it's more reliable for a dev script.
    } catch (error) {
        console.error("Error:", error);
    }
}
