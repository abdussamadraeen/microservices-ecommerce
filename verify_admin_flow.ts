

async function main() {
    const API_URL = "http://localhost:8000";
    console.log("1. Creating Product via Admin API...");

    // Simulate Admin Payload
    const newProduct = {
        name: "Admin Verification Product",
        shortDescription: "Created via Script",
        description: "This product was created to verify Admin->Client data flow.",
        price: 9999,
        inventory: 10,
        categorySlug: "xiaomi-series",
        images: ["https://placehold.co/400"],
        colors: ["Black"],
        sizes: ["Standard"]
    };

    try {
        const createRes = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        if (!createRes.ok) {
            console.error("Failed to create product:", await createRes.text());
            process.exit(1);
        }

        const created: any = await createRes.json();
        console.log(`Success! Created Product ID: ${created.id}`);

        console.log("2. Verifying Product is visible in Client List...");
        const listRes = await fetch(`${API_URL}/products?limit=100`);
        const products: any[] = await listRes.json();

        const found = products.find(p => p.id === created.id);
        if (found) {
            console.log("VERIFIED: Product found in list!");
            console.log(found);
        } else {
            console.error("FAILED: Product not found in list.");
            process.exit(1);
        }

    } catch (error) {
        console.error("Error during verification:", error);
    }
}

main();
