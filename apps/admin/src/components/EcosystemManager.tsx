"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "@repo/types";

// Schema for the form
const EcosystemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().min(1, "Subtitle is required"),
    heroProductId: z.string().min(1, "Hero Product is required"),
    sideProduct1: z.string().optional(),
    sideProduct2: z.string().optional(),
    sideProduct3: z.string().optional(),
});

export default function EcosystemManager() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const [products, setProducts] = useState<ProductType[]>([]);

    // 1. Fetch Products for the dropdowns
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?limit=1000`);
                if (res.ok) {
                    const data = await res.json();
                    // Sort alphabetically for easier selection
                    setProducts(data.sort((a: ProductType, b: ProductType) => a.name.localeCompare(b.name)));
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
        };
        fetchProducts();
    }, []);

    // 2. Fetch Current Config
    const { data: config, isLoading } = useQuery({
        queryKey: ["ecosystem-config"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/ecosystem`);
            if (!res.ok) throw new Error("Failed to fetch config");
            return res.json();
        },
    });

    const form = useForm<z.infer<typeof EcosystemSchema>>({
        resolver: zodResolver(EcosystemSchema),
        defaultValues: {
            title: "The Xiaomi Ecosystem.",
            subtitle: "Seamlessly connected. Beautifully designed.",
            heroProductId: "",
            sideProduct1: "",
            sideProduct2: "",
            sideProduct3: "",
        },
    });

    // Update form when data loads
    useEffect(() => {
        if (config) {
            form.reset({
                title: config.title || "The Xiaomi Ecosystem.",
                subtitle: config.subtitle || "Seamlessly connected. Beautifully designed.",
                heroProductId: config.heroProductId ? String(config.heroProductId) : "",
                sideProduct1: config.subProductIds?.[0] ? String(config.subProductIds[0]) : "",
                sideProduct2: config.subProductIds?.[1] ? String(config.subProductIds[1]) : "",
                sideProduct3: config.subProductIds?.[2] ? String(config.subProductIds[2]) : "",

            });
        }
    }, [config, form]);

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof EcosystemSchema>) => {
            const token = await getToken();

            // Convert individual fields back to array
            const subProductIds = [
                data.sideProduct1,
                data.sideProduct2,
                data.sideProduct3,
            ].filter(Boolean).map(Number); // Filter empty strings and convert to numbers

            const payload = {
                title: data.title,
                subtitle: data.subtitle,
                heroProductId: Number(data.heroProductId),
                subProductIds
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/ecosystem`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ecosystem-config"] });
            toast.success("Ecosystem layout updated successfully!");
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update layout");
        }
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <Card className="max-w-4xl mx-auto backdrop-blur-3xl bg-card/40 border-white/10">
            <CardHeader>
                <CardTitle>Xiaomi Ecosystem Grid</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section Title</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subtitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subtitle</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-4">Hero Product (Large Card)</h3>
                            <FormField
                                control={form.control}
                                name="heroProductId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Flagship Product</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={products.length === 0}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a product..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                        {p.name} (ID: {p.id})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription> This product will be shown with the largest emphasis.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-4">Side Grid (3 Slots)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map((num) => (
                                    <FormField
                                        key={num}
                                        control={form.control}
                                        name={`sideProduct${num}` as any}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slot {num}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={products.length === 0}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a product..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="0">None</SelectItem>
                                                        {products.map((p) => (
                                                            <SelectItem key={p.id} value={String(p.id)}>
                                                                {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={mutation.isPending} size="lg" className="w-full">
                            {mutation.isPending ? "Saving..." : "Save Configuration"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
