import type { Product, Category, ProductVariant } from "@repo/product-db";
import z from "zod";

export type ProductType = Product & { variants?: ProductVariant[] };

export type ProductsType = ProductType[];

export type StripeProductType = {
  id: string;
  name: string;
  price: number;
  images: string[];
};

export const colors = [
  "blue",
  "Blue",
  "green",
  "Green",
  "red",
  "Red",
  "yellow",
  "Yellow",
  "purple",
  "Purple",
  "orange",
  "Orange",
  "pink",
  "Pink",
  "brown",
  "Brown",
  "gray",
  "Gray",
  "black",
  "Black",
  "white",
  "White",
] as const;

export const clothingSizes = ["xs", "s", "m", "l", "xl", "xxl"] as const;
export const shoeSizes = [
  "6 UK",
  "7 UK",
  "8 UK",
  "9 UK",
  "10 UK",
  "11 UK",
  "12 UK",
] as const;
export const numericSizes = [
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;

export const storageSizes = [
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "2TB",
] as const;

export const sizes = [
  ...clothingSizes,
  ...shoeSizes,
  ...numericSizes,
  ...storageSizes,
] as const;

export const ProductFormSchema = z
  .object({
    name: z
      .string({ message: "Product name is required!" })
      .min(1, { message: "Product name is required!" }),
    shortDescription: z
      .string({ message: "Short description is required!" })
      .min(1, { message: "Short description is required!" })
      .max(60),
    description: z
      .string({ message: "Description is required!" })
      .min(1, { message: "Description is required!" }),
    price: z
      .number({ message: "Price is required!" })
      .min(1, { message: "Price is required!" }),
    inventory: z
      .number({ message: "Inventory is required!" })
      .min(0, { message: "Inventory cannot be negative" })
      .max(2147483647, { message: "Inventory cannot exceed 2,147,483,647" }),
    categorySlug: z
      .string({ message: "Category is required!" })
      .min(1, { message: "Category is required!" }),
    variantType: z.string(),
    variants: z
      .array(
        z.object({
          name: z.string(),
          price: z.number(),
          stock: z.number(),
          variantName: z.string().optional(),
          variantDescription: z.string().optional(),
        })
      ),
    sizes: z.array(z.string()),
    colors: z
      .array(z.string())
      .min(1, { message: "At least one color is required!" }),
    images: z.record(
      z.string(),
      z.union([z.string(), z.array(z.string())]),
      {
        message: "Image for each color is required!",
      }
    ),
  })
  .refine(
    (data) => {
      const missingImages = data.colors.filter((color: string) => {
        const image = data.images?.[color];
        if (!image) return true;
        if (Array.isArray(image) && image.length === 0) return true;
        return false;
      });
      return missingImages.length === 0;
    },
    {
      message: "Image is required for each selected color!",
      path: ["images"],
    }
  );

export type CategoryType = Category;

export const CategoryFormSchema = z.object({
  name: z
    .string({ message: "Name is Required!" })
    .min(1, { message: "Name is Required!" }),
  slug: z
    .string({ message: "Slug is Required!" })
    .min(1, { message: "Slug is Required!" }),
  parentId: z.number().optional(),
});
