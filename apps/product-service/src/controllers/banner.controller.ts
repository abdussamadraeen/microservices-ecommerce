import { Request, Response } from "express";
import { prisma } from "@repo/product-db";

export const createBanner = async (req: Request, res: Response) => {
  const data = req.body;
  const banner = await prisma.banner.create({ data });
  res.status(201).json(banner);
};

export const getBanners = async (req: Request, res: Response) => {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(banners);
};

export const updateBanner = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const banner = await prisma.banner.update({
    where: { id: Number(id) },
    data,
  });
  res.status(200).json(banner);
};

export const deleteBanner = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.banner.delete({ where: { id: Number(id) } });
  res.status(204).json();
};
