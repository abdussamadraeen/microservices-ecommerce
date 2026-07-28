import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Phones Category Structure...');

    // 1. Check Main Category
    const phones = await prisma.category.findUnique({
        where: { slug: 'phones' },
        include: { children: true }
    });

    if (!phones) {
        console.error('ERROR: "Phones" category not found!');
        return;
    }

    console.log(`Found "Phones" (ID: ${phones.id})`);
    console.log(`Children Count: ${phones.children.length}`);

    phones.children.forEach(child => {
        console.log(` - Child: ${child.name} (Slug: ${child.slug}, ParentID: ${child.parentId})`);
    });

    // 2. Check Subcategories explicitly
    const subSlugs = ['xiaomi-series', 'redmi-series', 'poco-phones'];
    for (const slug of subSlugs) {
        const cat = await prisma.category.findUnique({ where: { slug } });
        if (!cat) {
            console.error(`ERROR: Subcategory "${slug}" NOT FOUND.`);
        } else {
            console.log(`Subcategory "${slug}" found. ParentID: ${cat.parentId}`);
            if (cat.parentId !== phones.id) {
                console.error(`  --> ERROR: ParentID mismatch! Expected ${phones.id}, got ${cat.parentId}`);
            }
        }
    }

    // 3. Check Products for one subcategory
    const xiaomi = await prisma.category.findUnique({ where: { slug: 'xiaomi-series' } });
    if (xiaomi) {
        const products = await prisma.product.findMany({ where: { categorySlug: xiaomi.slug } });
        console.log(`Products in "Xiaomi Series": ${products.length}`);
        products.forEach(p => console.log(`  - ${p.name}`));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
