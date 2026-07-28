import type { Product } from "@repo/product-db";
import z from "zod";

export type CartItemType = Product & {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
};

export type CartItemsType = CartItemType[];

export const shippingFormSchema = z.object({
  name: z.string().min(1, "Name is required!"),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format")
    .min(1, "Email is required!"),
  phone: z
    .string()
    .min(10, "Phone number must be 10 digits!")
    .max(10, "Phone number must be 10 digits!")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number!"),
  address: z.string().min(1, "Address is required!"),
  city: z.string().min(1, "City is required!"),
});

export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

export type CartStoreStateType = {
  cart: CartItemsType;
  hasHydrated: boolean;
};

export type CartStoreActionsType = {
  addToCart: (product: CartItemType) => void;
  removeFromCart: (product: CartItemType) => void;
  updateQuantity: (product: CartItemType, quantity: number) => void;
  clearCart: () => void;
};
