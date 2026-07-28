import { prisma } from "@repo/product-db";
export const createCategory = async (req, res) => {
    const data = req.body;
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
};
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const category = await prisma.category.update({
        where: { id: Number(id) },
        data,
    });
    return res.status(200).json(category);
};
export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const category = await prisma.category.delete({
        where: { id: Number(id) },
    });
    return res.status(200).json(category);
};
export const getCategories = async (req, res) => {
    const categories = await prisma.category.findMany({
        include: {
            children: true,
            parent: true,
        },
        orderBy: {
            id: 'asc'
        }
    });
    return res.status(200).json(categories);
};
