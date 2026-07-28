import { PrismaClient } from "@repo/product-db";
const prisma = new PrismaClient();
async function main() {
    console.log("Checking Categories...");
    const phones = await prisma.category.findUnique({
        where: { slug: "phones" },
        include: { children: true }
    });
    if (!phones) {
        console.log("Category 'phones' not found!");
        return;
    }
    console.log("Phones Category:", phones);
    const xiaomi = await prisma.category.findUnique({
        where: { slug: "xiaomi-series" },
        include: {
            parent: true
        }
    });
    console.log("Xiaomi Series Category:", xiaomi);
    if (xiaomi?.parentId !== phones.id) {
        console.error("MISMATCH: Xiaomi Series parentId does not match Phones ID!");
    }
    else {
        console.log("MATCH: Xiaomi Series is a child of Phones.");
    }
    console.log("Checking Products query for 'phones'...");
    const category = "phones";
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { category: { slug: category } },
                { category: { parent: { slug: category } } },
            ]
        },
        select: { id: true, name: true, categorySlug: true }
    });
    console.log(`Found ${products.length} products for category 'phones':`);
    products.forEach(p => console.log(`- ${p.name} (${p.categorySlug})`));
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
