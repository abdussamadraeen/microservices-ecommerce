
import { prisma } from "@repo/product-db";

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                children: true,
            },
            // Fetch ALL categories (not just top-level) so NavMegaMenu
            // can find categories like "Watches" which is under "Electronics"
        });
        return categories;
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export async function getProductsByCategory(categorySlug: string, limit: number = 4) {
    try {
        // Find category first to get ID (if needed) or query by slug if schema supports it
        // Based on schema view, we might need relation or filtering
        // Let's assume Category has 'slug' and Product has relation to Category

        // Fetch products where category slug matches
        const products = await prisma.product.findMany({
            where: {
                category: {
                    slug: categorySlug
                }
            },
            take: limit,

        });

        return products;
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}
