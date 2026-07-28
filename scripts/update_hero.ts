
import { PrismaClient } from '../packages/product-db/generated/prisma';

const prisma = new PrismaClient();

const HERO_PRODUCT_ID = 68;

async function main() {
    console.log(`Updating Hero Product to ID: ${HERO_PRODUCT_ID}...`);

    try {
        // 1. Verify Product Exists
        const product = await prisma.product.findUnique({
            where: { id: HERO_PRODUCT_ID }
        });

        if (!product) {
            console.error(`Product with ID ${HERO_PRODUCT_ID} not found!`);
            process.exit(1);
        }

        console.log(`Found product: ${product.name}`);

        // 2. Get/Update Ecosystem Config
        const config = await prisma.ecosystemConfig.findFirst();

        if (config) {
            console.log("Updating existing config...");
            await prisma.ecosystemConfig.update({
                where: { id: config.id },
                data: {
                    heroProductId: HERO_PRODUCT_ID
                }
            });
        } else {
            console.log("Creating new config...");
            await prisma.ecosystemConfig.create({
                data: {
                    title: "The Xiaomi Ecosystem.",
                    subtitle: "Seamlessly connected. Beautifully designed.",
                    heroProductId: HERO_PRODUCT_ID,
                    subProductIds: []
                }
            });
        }

        console.log("Successfully updated Hero Product!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
