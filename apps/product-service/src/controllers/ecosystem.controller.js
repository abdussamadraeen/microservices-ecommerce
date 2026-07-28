import { prisma } from "@repo/product-db";
export const getEcosystemConfig = async (req, res) => {
    const config = await prisma.ecosystemConfig.findFirst();
    res.status(200).json(config || {});
};
export const updateEcosystemConfig = async (req, res) => {
    const data = req.body;
    // Upsert pattern: update first record if exists, or create new
    const first = await prisma.ecosystemConfig.findFirst();
    if (first) {
        const updated = await prisma.ecosystemConfig.update({
            where: { id: first.id },
            data: {
                title: data.title,
                subtitle: data.subtitle,
                heroProductId: data.heroProductId ? Number(data.heroProductId) : null,
                // Handle array input which might come as string or array
                subProductIds: Array.isArray(data.subProductIds)
                    ? data.subProductIds.map((id) => Number(id))
                    : []
            },
        });
        res.status(200).json(updated);
    }
    else {
        const created = await prisma.ecosystemConfig.create({
            data: {
                title: data.title,
                subtitle: data.subtitle,
                heroProductId: data.heroProductId ? Number(data.heroProductId) : null,
                subProductIds: Array.isArray(data.subProductIds)
                    ? data.subProductIds.map((id) => Number(id))
                    : []
            },
        });
        res.status(201).json(created);
    }
};
