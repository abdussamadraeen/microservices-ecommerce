import { PrismaClient } from "@repo/product-db";
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.category.count();
    console.log(`Total categories: ${count}`);
    const categories = await prisma.category.findMany({
        take: 5,
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
    console.log("Sample categories:", JSON.stringify(categories, null, 2));
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
