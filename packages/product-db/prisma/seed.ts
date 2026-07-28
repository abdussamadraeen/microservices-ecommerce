import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const mainCategories = [
    { name: "Phones", slug: "phones" },
    { name: "Tablets", slug: "tablets" },
    { name: "TV & Smart Home", slug: "smart-home" },
    { name: "Audio", slug: "audio" },
    { name: "Watches", slug: "watches" },
    { name: "Laptops", slug: "laptops" },
    { name: "Accessories", slug: "accessories" },
];

const xiaomiPhones = [
    {
        name: "Xiaomi 15 Ultra",
        shortDescription: "Co-engineered with Leica. Pinnacle photography.",
        description: "The ultimate photography experience. Featuring a quad-camera system with Leica optics, Snapdragon 8 Gen 4 processor, and a stunning 2K AMOLED display.",
        price: 1299,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1708949826.97232230.png"],
        colors: ["Black", "White", "Silver"],
        sizes: ["256GB", "512GB", "1TB"],
    },
    {
        name: "Xiaomi 15",
        shortDescription: "Compact flagship.",
        description: "Small size, huge performance. The perfect balance of power and portability with the latest flagship processor.",
        price: 999,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1708949826.97232230.png"],
        colors: ["Black", "White", "Green"],
        sizes: ["256GB", "512GB"],
    },
    {
        name: "Xiaomi 14T Pro",
        shortDescription: "Master light, capture night.",
        description: "Leica Summilux optical lens. Advanced night photography capabilities and pro-grade video features.",
        price: 799,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1727339712.91599386.png"],
        colors: ["Titan Gray", "Titan Blue", "Titan Black"],
        sizes: ["256GB", "512GB", "1TB"],
    }
];

const redmiPhones = [
    {
        name: "Redmi Note 14 Pro+",
        shortDescription: "Iconic shots, infinite speed.",
        description: "200MP OIS camera. Super-fast charging and long-lasting battery life for all-day usage.",
        price: 399,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1705292497.66986641.png"],
        colors: ["Midnight Black", "Moonlight White", "Aurora Purple"],
        sizes: ["256GB", "512GB"],
    }
];

const smartWatches = [
    {
        name: "Xiaomi Watch 2",
        shortDescription: "WearOS by Google.",
        description: "Smart life on your wrist. Google apps, precise health tracking, and elegant design.",
        price: 199,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1708425714.49257662.png"],
        colors: ["Black", "Silver"],
        sizes: ["One Size"],
    },
    {
        name: "Xiaomi Watch S3",
        shortDescription: "Interchangeable bezels.",
        description: "Style that changes with you. Unique interchangeable bezel design and HyperOS.",
        price: 149,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1708425714.49257662.png"], // Placeholder
        colors: ["Black", "Silver"],
        sizes: ["One Size"],
    },
    {
        name: "Redmi Watch 4",
        shortDescription: "Ultra-large display.",
        description: "See more, do more. 1.97 inch AMOLED display and long battery life.",
        price: 99,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1705307567.89255011.png"],
        colors: ["Black", "Grey"],
        sizes: ["One Size"],
    }
];

const smartBands = [
    {
        name: "Xiaomi Smart Band 9",
        shortDescription: "Your style, your pace.",
        description: "Vibrant display, all-day health monitoring, and stylish straps.",
        price: 49,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1723114995.59733225.png"],
        colors: ["Black", "Silver", "Pink", "Blue"],
        sizes: ["One Size"],
    }
];

const tvs = [
    {
        name: "Xiaomi TV A Pro 55",
        shortDescription: "4K QLED Google TV.",
        description: "Immersive viewing experience with Dolby Vision and Dolby Audio.",
        price: 499,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1694156646.60271545.png"],
        colors: ["Black"],
        sizes: ["55 inch", "43 inch", "32 inch"],
    }
];

const smartHomeAppliances = [
    {
        name: "Xiaomi Smart Air Fryer 6.5L",
        shortDescription: "Healthy cooking, large capacity.",
        description: "360 degree convection heating for even cooking without oil.",
        price: 129,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1705663673.49072462.png"],
        colors: ["White", "Black"],
        sizes: ["6.5L"],
    },
    {
        name: "Xiaomi Robot Vacuum X20+",
        shortDescription: "Flagship all-in-one.",
        description: "Auto-empty, auto-clean, auto-dry. Hands-free cleaning for your home.",
        price: 499,
        images: ["https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1711620023.77443833.png"],
        colors: ["White"],
        sizes: ["Standard"],
    }
];

async function main() {
    console.log('Start seeding categories...');

    // 1. Seed Main Categories
    const categoryMap = new Map<string, number>();

    for (const cat of mainCategories) {
        const upserted = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name },
            create: { name: cat.name, slug: cat.slug },
        });
        categoryMap.set(cat.slug, upserted.id);
        console.log(`Upserted Main Category: ${upserted.name}`);
    }

    // 2. Seed Sub Categories for Phones
    const phonesId = categoryMap.get("phones");
    if (phonesId) {
        // Xiaomi Series
        const xiaomiSeries = await prisma.category.upsert({
            where: { slug: "xiaomi-series" },
            update: { name: "Xiaomi Series", parentId: phonesId },
            create: { name: "Xiaomi Series", slug: "xiaomi-series", parentId: phonesId },
        });
        console.log("Upserted Sub: Xiaomi Series");

        // Seed Xiaomi Products
        for (const p of xiaomiPhones) {
            // Check if product exists to avoid duplicates on re-run
            const exists = await prisma.product.findFirst({ where: { name: p.name } });
            if (!exists) {
                await prisma.product.create({
                    data: {
                        ...p,
                        categorySlug: xiaomiSeries.slug,
                        images: p.images
                    }
                });
                console.log(`Created product: ${p.name}`);
            }
        }


        // Redmi Series
        const redmiSeries = await prisma.category.upsert({
            where: { slug: "redmi-series" },
            update: { name: "Redmi Series", parentId: phonesId },
            create: { name: "Redmi Series", slug: "redmi-series", parentId: phonesId },
        });
        console.log("Upserted Sub: Redmi Series");

        // Seed Redmi Products
        for (const p of redmiPhones) {
            const exists = await prisma.product.findFirst({ where: { name: p.name } });
            if (!exists) {
                await prisma.product.create({
                    data: {
                        ...p,
                        categorySlug: redmiSeries.slug,
                        images: p.images
                    }
                });
                console.log(`Created product: ${p.name}`);
            }
        }


        // POCO Series (Just Category)
        await prisma.category.upsert({
            where: { slug: "poco-phones" },
            update: { name: "POCO Phones", parentId: phonesId },
            create: { name: "POCO Phones", slug: "poco-phones", parentId: phonesId },
        });
        console.log("Upserted Sub: POCO Phones");
    }

    // 3. Seed Sub Categories for TV & Smart Home
    const smartHomeId = categoryMap.get("smart-home");
    if (smartHomeId) {
        // TV
        const tvCat = await prisma.category.upsert({
            where: { slug: "xiaomi-tv" },
            update: { name: "TV", parentId: smartHomeId },
            create: { name: "TV", slug: "xiaomi-tv", parentId: smartHomeId },
        });
        console.log("Upserted Sub: TV");

        for (const p of tvs) {
            const exists = await prisma.product.findFirst({ where: { name: p.name } });
            if (!exists) {
                await prisma.product.create({
                    data: {
                        ...p,
                        categorySlug: tvCat.slug,
                        images: p.images
                    }
                });
                console.log(`Created product: ${p.name}`);
            }
        }

        // Smart Home Appliances
        const smartHomeAppCat = await prisma.category.upsert({
            where: { slug: "smart-home-appliances" },
            update: { name: "Smart Home Appliances", parentId: smartHomeId },
            create: { name: "Smart Home Appliances", slug: "smart-home-appliances", parentId: smartHomeId },
        });
        console.log("Upserted Sub: Smart Home Appliances");

        for (const p of smartHomeAppliances) {
            const exists = await prisma.product.findFirst({ where: { name: p.name } });
            if (!exists) {
                await prisma.product.create({
                    data: {
                        ...p,
                        categorySlug: smartHomeAppCat.slug,
                        images: p.images
                    }
                });
                console.log(`Created product: ${p.name}`);
            }
        }
    }

    // 4. Seed Sub Categories for Audio
    // 4. Seed Sub Categories for Audio (Only Audio now, but we don't have audio products in this seed yet?)
    const audioId = categoryMap.get("audio");

    // 5. Seed Sub Categories for Watches
    const watchesId = categoryMap.get("watches");
    if (watchesId) {
        // Smart Watches
        const watchesCat = await prisma.category.upsert({
            where: { slug: "smart-watches" },
            update: { name: "Smart Watches", parentId: watchesId },
            create: { name: "Smart Watches", slug: "smart-watches", parentId: watchesId },
        });
        console.log("Upserted Sub: Smart Watches");

        for (const p of smartWatches) {
            const exists = await prisma.product.findFirst({ where: { name: p.name } });
            if (!exists) {
                await prisma.product.create({
                    data: {
                        ...p,
                        categorySlug: watchesCat.slug,
                        images: p.images
                    }
                });
                console.log(`Created product: ${p.name}`);
            }
        }

        // Smart Bands
        const bandsCat = await prisma.category.upsert({
            where: { slug: "smart-bands" },
            update: { name: "Smart Bands", parentId: watchesId },
            create: { name: "Smart Bands", slug: "smart-bands", parentId: watchesId },
        });
        console.log("Upserted Sub: Smart Bands");

        for (const p of smartBands) {
            const exists = await prisma.product.findFirst({ where: { name: p.name } });
            if (!exists) {
                await prisma.product.create({
                    data: {
                        ...p,
                        categorySlug: bandsCat.slug,
                        images: p.images
                    }
                });
                console.log(`Created product: ${p.name}`);
            }
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
