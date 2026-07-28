async function main() {
    try {
        const baseUrl = 'http://localhost:8000';

        console.log('--- Fetching all products ---');
        const allRes = await fetch(`${baseUrl}/products?limit=100`);
        const allProducts = await allRes.json();
        console.log(`Total products: ${allProducts.length}`);
        console.log('Sample names:', allProducts.slice(0, 3).map(p => p.name));

        console.log('\n--- Fetching phones category ---');
        const phoneRes = await fetch(`${baseUrl}/products?category=phones&limit=100`);
        const phoneProducts = await phoneRes.json();
        console.log(`Phone products: ${phoneProducts.length}`);
        phoneProducts.forEach(p => {
            console.log(`- ${p.name} (Cat: ${p.category?.slug}, Parent: ${p.category?.parent?.slug})`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
