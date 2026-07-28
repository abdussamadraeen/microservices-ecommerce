import { PrismaClient } from './packages/product-db/src/index';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:password@localhost:54320/product_db"
        }
    }
});

async function main() {
    console.log("Checking Xiaomi 17...");
    const product = await prisma.product.findFirst({
        where: { name: "Xiaomi 17" },
    });

    if (!product) {
        console.log("Product not found");
        return;
    }

    console.log("--- PRODUCT DATA ---");
    console.log("Colors:", JSON.stringify(product.colors));
    // Cast images to object to get keys
    const images = product.images as Record<string, any>;
    console.log("Image Keys:", JSON.stringify(Object.keys(images)));

    const colors = product.colors as string[];
    const imageKeys = Object.keys(images);

    const missing = colors.filter(c => !imageKeys.includes(c));
    console.log("Mismatch (Colors without Images):", missing);

    const extra = imageKeys.filter(k => !colors.includes(k));
    console.log("Mismatch (Images without Colors):", extra);
    console.log("--------------------");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
