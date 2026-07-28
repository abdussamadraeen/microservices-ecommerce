
async function main() {
    try {
        console.log("Fetching stats from http://localhost:8005/stats...");
        const res = await fetch("http://localhost:8005/stats");
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
        }
        const data = await res.json();
        console.log("Stats received:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Verification failed:", err.message);
    }
}
main();
