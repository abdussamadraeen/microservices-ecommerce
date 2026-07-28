
// import { PrismaClient } from "@repo/order-db"; // Removed unused import

// Mock implementation since we can't easily curl the endpoint without authn if it was protected, 
// but I commented out auth for now or we can verify via fetch if service is running.
// Actually, let's just use fetch if the service is up.

async function main() {
    console.log("Verifying /stats endpoint...");
    try {
        const res = await fetch("http://localhost:8005/stats");
        if (!res.ok) {
            throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("Stats received:", JSON.stringify(data, null, 2));

        if (typeof data.total !== 'number') {
            throw new Error("Invalid response format: missing total");
        }
        console.log("✅ Verification Successful");
    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

main();
