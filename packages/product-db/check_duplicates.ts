import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for duplicate categories...');

    // Find categories with "TV" in name or slug
    const tvCats = await prisma.category.findMany({
        where: {
            OR: [
                { slug: { contains: 'tv' } },
                { name: { contains: 'TV' } }
            ]
        }
    });

    console.log('Found TV-related categories:', tvCats);

    // We expect "TV & Smart Home" (parent) and "TV" (child of Smart Home).
    // User says "2 tv one is what i created in with electronics... also one with tv and smart appliances"
    // If there is a "TV" category under "Electronics", we should find it.

    // Also check for "Electronics" category
    const electronics = await prisma.category.findFirst({ where: { name: 'Electronics' } });
    if (electronics) {
        console.log('Found Electronics category:', electronics);
        const output = await prisma.category.findMany({ where: { parentId: electronics.id } });
        console.log('Children of Electronics:', output);
    } else {
        console.log('Electronics category not found (which is good if it was renamed/removed)');
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
