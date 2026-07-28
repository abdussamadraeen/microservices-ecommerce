// Native fetch used

// In Node 18+, fetch is global.
async function main() {
    try {
        const res = await fetch('http://localhost:8000/categories');
        const categories = await res.json();

        const phones = categories.find(c => c.slug === 'phones');
        if (phones) {
            console.log(JSON.stringify(phones, null, 2));
        } else {
            console.log('Phones category NOT found');
            // Print all slugs to see what exists
            console.log('Available slugs:', categories.map(c => c.slug));
        }
    } catch (e) {
        console.error(e);
    }
}

main();
