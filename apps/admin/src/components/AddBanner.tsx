"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BannerFormSchema } from "@repo/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";
import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BannerType } from "@repo/types";

interface AddBannerProps {
    bannerToEdit?: BannerType;
    onSuccess?: () => void;
}

const AddBanner = ({ bannerToEdit, onSuccess }: AddBannerProps) => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof BannerFormSchema>>({
        resolver: zodResolver(BannerFormSchema),
        defaultValues: {
            title: bannerToEdit?.title || "",
            image: bannerToEdit?.image || "",
            link: bannerToEdit?.link || "",
            // @ts-ignore
            description: (bannerToEdit as any)?.description || "",
            // @ts-ignore
            textColor: (bannerToEdit as any)?.textColor || "#ffffff",
            // @ts-ignore - showTitle might be missing from generated types yet
            showTitle: bannerToEdit?.showTitle ?? true,
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof BannerFormSchema>) => {
            const token = await getToken();
            const url = bannerToEdit
                ? `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/banners/${bannerToEdit.id}`
                : `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/banners`;

            const method = bannerToEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
            );
            if (!res.ok) {
                throw new Error("Failed to save banner");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
            toast.success(bannerToEdit ? "Banner updated" : "Banner created");
            form.reset();
            if (onSuccess) onSuccess();
        },
        onError: () => {
            toast.error("Failed to save banner");
        }
    })

    return (
        <SheetContent className="overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{bannerToEdit ? "Edit Banner" : "Add Banner"}</SheetTitle>
                <SheetDescription>
                    {bannerToEdit ? "Update existing banner details." : "Add a new banner to the homepage slider."}
                </SheetDescription>
            </SheetHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                    className="space-y-4 mt-4"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Summer Sale" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="Quantum Dot Display" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Text Color</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        {/* Color picker input - updates field but doesn't hold ref */}
                                        <Input
                                            type="color"
                                            className="w-12 p-1 h-10"
                                            value={field.value || "#ffffff"}
                                            onChange={field.onChange}
                                        />
                                        {/* Text input - holds the ref and main control */}
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="#ffffff"
                                            className="flex-1"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="link"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="/products?category=sale" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="showTitle"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Show Title
                                    </FormLabel>
                                    <FormDescription>
                                        Display the title text over the banner image?
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append("file", file);
                                                    formData.append("upload_preset", "ecommerce");
                                                    try {
                                                        const res = await fetch(
                                                            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                                                            {
                                                                method: "POST",
                                                                body: formData,
                                                            }
                                                        );
                                                        const data = await res.json();
                                                        field.onChange(data.secure_url);
                                                    } catch (error) {
                                                        console.error(error);
                                                        toast.error("Image upload failed");
                                                    }
                                                }
                                            }}
                                        />
                                        {field.value && (
                                            <div className="relative w-full h-32 rounded-md overflow-hidden bg-slate-100 border">
                                                <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Creating..." : "Create Banner"}
                    </Button>
                </form>
            </Form>
        </SheetContent >
    )
}

export default AddBanner;
