import type { Banner } from "@repo/product-db";
import { z } from "zod";

export type BannerType = Banner;

export const BannerFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image: z.string().min(1, "Image is required"),
  link: z.string().min(1, "Link is required"),
  showTitle: z.boolean(),
  description: z.string().optional(),
  textColor: z.string().optional(),
});
