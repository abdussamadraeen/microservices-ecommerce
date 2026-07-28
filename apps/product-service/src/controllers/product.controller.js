import { prisma, Prisma } from "@repo/product-db";
import { producer } from "../utils/kafka";
export const createProduct = async (req, res) => {
    try {
        const data = req.body;
        const { colors, images } = data;
        if (!colors || !Array.isArray(colors) || colors.length === 0) {
            return res.status(400).json({ message: "Colors array is required!" });
        }
        if (!images || typeof images !== "object") {
            return res.status(400).json({ message: "Images object is required!" });
        }
        const missingColors = colors.filter((color) => !(color in images));
        if (missingColors.length > 0) {
            return res
                .status(400)
                .json({ message: "Missing images for colors!", missingColors });
        }
        const { variants, ...productData } = data;
        const product = await prisma.product.create({
            data: {
                ...productData,
                variants: variants && variants.length > 0 ? {
                    create: variants.map((v) => ({
                        name: v.name,
                        price: v.price,
                        stock: v.stock || 0,
                        variantName: v.variantName,
                        variantDescription: v.variantDescription
                    }))
                } : undefined
            },
        });
        const productImages = Object.values(product.images)
            .flat()
            .filter((img) => typeof img === "string");
        const stripeProduct = {
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            images: productImages,
        };
        producer.send("product.created", { value: stripeProduct });
        res.status(201).json(product);
    }
    catch (err) {
        console.error("Error creating product:", err);
        try {
            const fs = await import("node:fs");
            fs.writeFileSync("e:/microservices-ecommerce-main/product_error.log", JSON.stringify({ error: err.message, stack: err.stack, body: req.body }, null, 2));
        }
        catch (e) {
            console.error("Failed to write error log", e);
        }
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[UpdateProduct] Received request for ID: ${id}`, req.body);
        const { variants, ...updateData } = req.body;
        // Transaction to update product and replace variants
        const updatedProduct = await prisma.$transaction(async (tx) => {
            // 1. Update basic product info
            const product = await tx.product.update({
                where: { id: Number(id) },
                data: updateData,
            });
            // 2. If variants provided, replace them
            if (variants) {
                await tx.productVariant.deleteMany({
                    where: { productId: Number(id) },
                });
                if (variants.length > 0) {
                    await tx.productVariant.createMany({
                        data: variants.map((v) => ({
                            productId: Number(id),
                            name: v.name,
                            price: v.price,
                            stock: v.stock || 0,
                            variantName: v.variantName,
                            variantDescription: v.variantDescription
                        })),
                    });
                }
            }
            return product;
        });
        // Fetch fresh data with variants
        const finalProduct = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: { variants: true }
        });
        return res.status(200).json(finalProduct);
    }
    catch (err) {
        console.error("Error updating product:", err);
        try {
            const fs = await import("node:fs");
            fs.writeFileSync("e:/microservices-ecommerce-main/product_update_error.log", JSON.stringify({ error: err.message, stack: err.stack, body: req.body }, null, 2));
        }
        catch (e) {
            console.error("Failed to write error log", e);
        }
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await prisma.product.delete({
            where: { id: Number(id) },
        });
        producer.send("product.deleted", { value: Number(id) });
        return res.status(200).json(deletedProduct);
    }
    catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
export const getProducts = async (req, res) => {
    try {
        const { sort, category, search, limit, lowStock } = req.query;
        const orderBy = (() => {
            switch (sort) {
                case "asc":
                    return { price: Prisma.SortOrder.asc };
                case "desc":
                    return { price: Prisma.SortOrder.desc };
                case "oldest":
                    return { createdAt: Prisma.SortOrder.asc };
                default:
                    return { createdAt: Prisma.SortOrder.desc };
            }
        })();
        const where = {
            ...(category
                ? {
                    OR: [
                        { category: { slug: category } },
                        { category: { parent: { slug: category } } },
                    ],
                }
                : {}),
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
            ...(lowStock === "true" ? {
                variants: {
                    some: {
                        stock: {
                            lte: 10
                        }
                    }
                }
            } : {})
        };
        const products = await prisma.product.findMany({
            where,
            orderBy,
            take: limit ? Number(limit) : undefined,
            include: {
                category: true,
                variants: true,
            },
        });
        res.status(200).json(products);
    }
    catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err instanceof Error ? err.message : String(err)
        });
    }
};
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                variants: true,
            }
        });
        return res.status(200).json(product);
    }
    catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
