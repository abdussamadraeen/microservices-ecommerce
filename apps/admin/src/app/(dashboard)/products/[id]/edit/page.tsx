"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductFormSchema, sizes, clothingSizes, shoeSizes, numericSizes, storageSizes } from "@repo/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, use, useMemo } from "react";
import Image from "next/image";
import { ColorPicker } from "@/components/ColorPicker";
import { Upload, X } from "lucide-react";

const fetchCategories = async () => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/categories`
    );
    if (!res.ok) throw new Error("Failed to fetch categories!");
    return await res.json();
};

const fetchProduct = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    return await res.json();
}

// Categories that truly don't need any size/capacity option
const CATEGORIES_WITHOUT_SIZES = ['accessories', 'cameras', 'watches', 'bags', 'smart-home'];
// Keywords for categories that use storage (GB/TB)
const STORAGE_CATEGORY_KEYWORDS = ['phone', 'tablet', 'laptop', 'electronics', 'console'];
// Keywords for shoe sizes
const SHOE_KEYWORDS = ['shoe', 'footwear', 'sneaker', 'boot', 'sandal', 'heel', 'slipper'];

const EditProductPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const [imageMode, setImageMode] = useState<'json' | 'upload'>('json');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [uploadedImages, setUploadedImages] = useState<Record<string, string[]>>({});

    const form = useForm({
        resolver: zodResolver(ProductFormSchema),
        defaultValues: {
            name: "",
            shortDescription: "",
            description: "",
            price: 0,
            inventory: 0,
            variantType: "Size",
            variants: [],
            categorySlug: "",
            sizes: [],
            colors: [],
            images: {},
        },
    });

    const variants = form.watch("variants");

    // Sync inventory with variants stock
    useEffect(() => {
        if (variants && variants.length > 0) {
            const totalStock = variants.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0);
            form.setValue("inventory", totalStock);
        }
    }, [variants, form]);

    // Watch for category changes to conditionally hide sizes
    const selectedCategorySlug = form.watch("categorySlug") || "";

    // Determine if sizes should be shown and which ones
    const isShoeCategory = SHOE_KEYWORDS.some(cat => selectedCategorySlug.toLowerCase().includes(cat));
    const isStorageCategory = STORAGE_CATEGORY_KEYWORDS.some(cat => selectedCategorySlug.toLowerCase().includes(cat));
    const shouldShowSizes = !CATEGORIES_WITHOUT_SIZES.some(cat => selectedCategorySlug.toLowerCase().includes(cat)) || isStorageCategory || isShoeCategory;

    let availableSizes: ReadonlyArray<string> = [...clothingSizes, ...numericSizes];
    let sizeLabel = "Sizes";

    if (isShoeCategory) {
        availableSizes = shoeSizes;
        sizeLabel = "Size (UK)";
    } else if (isStorageCategory) {
        availableSizes = storageSizes;
        sizeLabel = "Storage Capacity";
    }

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    const { data: product, isLoading: isProductLoading } = useQuery({
        queryKey: ["product", id],
        queryFn: () => fetchProduct(id)
    });

    useEffect(() => {
        if (product) {
            // Normalize images to ensure they are always string arrays
            const rawImages = (typeof product.images === 'object' && product.images !== null) ? product.images : {};
            const normalizedImages: Record<string, string[]> = {};

            Object.keys(rawImages).forEach((key) => {
                const value = rawImages[key];
                if (Array.isArray(value)) {
                    normalizedImages[key] = value.map(String); // Ensure all items are strings
                } else if (typeof value === 'string') {
                    normalizedImages[key] = [value];
                }
            });

            form.reset({
                name: product.name,
                shortDescription: product.shortDescription,
                description: product.description,
                price: product.price,
                inventory: product.inventory,
                // Handle case where category might be an object or flat field
                categorySlug: product.categorySlug || product.category?.slug || "",
                variantType: product.variantType || "Size",
                variants: (product.variants || []).map((v: any) => ({
                    ...v,
                    variantName: v.variantName || "",
                    variantDescription: v.variantDescription || ""
                })),
                sizes: product.sizes,
                colors: product.colors,
                images: normalizedImages
            });
            setUploadedImages(normalizedImages);
        }
    }, [product, form]);

    // ... (keep handleImageUpload and removeImage)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, color: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const urls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file) continue;
            const reader = new FileReader();

            await new Promise((resolve) => {
                reader.onloadend = () => {
                    urls.push(reader.result as string);
                    resolve(true);
                };
                reader.readAsDataURL(file);
            });
        }

        const newImages = {
            ...uploadedImages,
            [color]: [...(uploadedImages[color] || []), ...urls]
        };

        setUploadedImages(newImages);
        form.setValue('images', newImages);
    };

    const removeImage = (color: string, index: number) => {
        const newImages = { ...uploadedImages };
        if (newImages[color]) {
            newImages[color] = newImages[color].filter((_, i) => i !== index);
            if (newImages[color].length === 0) delete newImages[color];
        }

        setUploadedImages(newImages);
        form.setValue('images', newImages);
    };

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof ProductFormSchema>) => {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: "Failed to update product!" }));
                throw new Error(errorData.message || "Failed to update product!");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", id] });
            toast.success("Product updated successfully");
            router.push("/products");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (isProductLoading) return <div>Loading...</div>;

    return (
        <div className="p-8 bg-white dark:bg-slate-950 rounded-lg shadow-sm max-w-4xl mx-auto my-8">
            <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
            <Form {...form}>
                <form
                    className="space-y-8"
                    onSubmit={form.handleSubmit(
                        (data) => mutation.mutate(data),
                        (errors) => {
                            console.error("Form Validation Errors (Raw):", errors);
                            const currentValues = form.getValues();
                            console.error("Form Values:", currentValues);

                            // Manual Schema Validation to catch hidden errors
                            const validationResult = ProductFormSchema.safeParse(currentValues);
                            if (!validationResult.success) {
                                console.error("MANUAL VALIDATION FAILED:", JSON.stringify(validationResult.error.format(), null, 2));
                                toast.error("Schema validation failed. Check console for details.");
                            } else {
                                console.error("MANUAL VALIDATION PASSED. React Hook Form is out of sync.");
                            }

                            // Check for specific field errors
                            if (errors.images) {
                                toast.error((errors.images as any)?.message || "Image Validation Error");
                            } else if (errors.variants) {
                                // Variants error might be an array or object
                                const variantErrors = Array.isArray(errors.variants)
                                    ? errors.variants.filter((e: any) => e)
                                    : [errors.variants];

                                if (variantErrors.length > 0) {
                                    toast.error("Please check variants. Name, Price, and Stock are required.");
                                } else {
                                    toast.error("Variants validation failed.");
                                }
                            } else if (Object.keys(errors).length > 0) {
                                const errorFields = Object.keys(errors).join(", ");
                                toast.error(`Please check these fields: ${errorFields}`);
                            } else {
                                // Fallback for empty error object
                                toast.error("Validation failed. Please check all fields (especially Variants and Images).");
                                // Try to manually validate variants as a fallback check
                                const currentVariants = form.getValues("variants");
                                if (currentVariants && currentVariants.length > 0) {
                                    const invalidVariant = currentVariants.find((v: any) => !v.name && v.name !== "");
                                    if (invalidVariant) console.error("Found variant with invalid name:", invalidVariant);
                                }
                            }
                        }
                    )}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* ... (Keep Name field) ... */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>Product Name</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* ... (Keep Short Description) ... */}
                            <FormField
                                control={form.control}
                                name="shortDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* ... (Keep Description) ... */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="h-32" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* ... (Keep Price) ... */}
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                {...field}
                                                value={field.value === 0 ? "" : field.value}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "") field.onChange(0);
                                                    else {
                                                        const num = Number(val);
                                                        if (!isNaN(num) && num >= 0) field.onChange(num);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* ... (Keep Inventory) ... */}
                            <FormField
                                control={form.control}
                                name="inventory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inventory</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                {...field}
                                                value={field.value === 0 ? "" : field.value}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "") field.onChange(0);
                                                    else {
                                                        const num = Number(val);
                                                        if (!isNaN(num) && num >= 0) field.onChange(num);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>Stock quantity (0 = Sold Out)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Add ColorPicker here for editing colors */}
                            <FormField
                                control={form.control}
                                name="colors"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Colors</FormLabel>
                                        <FormControl>
                                            <ColorPicker
                                                selectedColors={field.value || []}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Select the available colors for the product.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {shouldShowSizes && (
                                <FormField
                                    control={form.control}
                                    name="sizes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{sizeLabel}</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableSizes.map((size) => (
                                                        <Button
                                                            key={size}
                                                            type="button"
                                                            variant={field.value?.includes(size) ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => {
                                                                const current = field.value || [];
                                                                const updated = current.includes(size)
                                                                    ? current.filter((s) => s !== size)
                                                                    : [...current, size];
                                                                field.onChange(updated);
                                                            }}
                                                        >
                                                            {size}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormDescription>Select sizes available for this product.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="categorySlug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(categories || [])
                                                        .filter((cat: any) => !cat.parentId)
                                                        .map((cat: any, catIndex: number) => (
                                                            cat.children && cat.children.length > 0 ? (
                                                                <SelectGroup key={`group-${catIndex}-${cat.slug}`}>
                                                                    <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-gray-50 dark:bg-slate-900">{cat.name}</SelectLabel>
                                                                    {cat.children.map((child: any, childIndex: number) => (
                                                                        <SelectItem key={`child-${catIndex}-${childIndex}-${child.slug}-${child.id}`} value={child.slug} className="pl-6">
                                                                            {child.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            ) : (
                                                                <SelectItem key={`item-${catIndex}-${cat.slug}`} value={cat.slug}>
                                                                    {cat.name}
                                                                </SelectItem>
                                                            )
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Right Column - Images & Options */}
                        <div className="space-y-6">
                            {/* Image Editing Section */}
                            <div className="border p-4 rounded-md bg-gray-50 dark:bg-slate-900 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-sm uppercase text-gray-500 dark:text-gray-400">Image Management</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={imageMode === 'json' ? 'default' : 'outline'}
                                            onClick={() => setImageMode('json')}
                                        >
                                            JSON
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={imageMode === 'upload' ? 'default' : 'outline'}
                                            onClick={() => setImageMode('upload')}
                                        >
                                            Upload
                                        </Button>
                                    </div>
                                </div>

                                {imageMode === 'json' ? (
                                    <>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Edit Image URLs directly (JSON format)</p>
                                        <FormField
                                            control={form.control}
                                            name="images"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Images JSON</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            value={JSON.stringify(field.value, null, 2)}
                                                            onChange={(e) => {
                                                                try {
                                                                    const parsed = JSON.parse(e.target.value);
                                                                    field.onChange(parsed);
                                                                    setUploadedImages(parsed);
                                                                } catch (err) {
                                                                    // Allow editing invalid json temporarily
                                                                }
                                                            }}
                                                            className="font-mono text-xs h-64 dark:bg-slate-950"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Structure: {"{ \"color\": [\"url1\", \"url2\"] }"}
                                                    </FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Upload images for each color (PNG, JPEG, JPG)</p>

                                        {/* Display validation error for images if any */}
                                        {form.formState.errors.images && (
                                            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
                                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                                    {(form.formState.errors.images as any)?.message || "Validation Error"}
                                                </p>
                                            </div>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="colors"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Select Color to Upload</FormLabel>
                                                    <Select onValueChange={setSelectedColor} value={selectedColor}>
                                                        <FormControl>
                                                            <SelectTrigger className="dark:bg-slate-950">
                                                                <SelectValue placeholder="Choose a color" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {field.value?.map((color) => (
                                                                <SelectItem key={color} value={color}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                                                                        {color}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />

                                        {selectedColor && (
                                            <div className="space-y-2">
                                                <label className="cursor-pointer">
                                                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
                                                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload images for {selectedColor}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPEG, JPG</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/png,image/jpeg,image/jpg"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload(e, selectedColor)}
                                                    />
                                                </label>

                                                {uploadedImages[selectedColor] && uploadedImages[selectedColor].length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                                        {uploadedImages[selectedColor].map((url, index) => (
                                                            <div key={index} className="relative group">
                                                                <img
                                                                    src={url}
                                                                    alt={`${selectedColor} ${index + 1}`}
                                                                    className="w-full h-24 object-cover rounded border dark:border-slate-700"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(selectedColor, index)}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* VARIANTS SECTION */}
                            <div className="border p-4 rounded-md bg-muted/40 space-y-4 dark:border-gray-700">
                                <h3 className="font-medium">Product Variants</h3>
                                <FormField
                                    control={form.control}
                                    name="variantType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Variant Label</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Size, Color, Storage, RAM" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                What defines the different options? (Default: Size)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Dynamic Variants List */}
                                <div className="space-y-2">
                                    <div className="flex justify-end mb-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                            onClick={() => {
                                                const colors = form.getValues("colors") || [];
                                                const sizes = form.getValues("sizes") || [];
                                                const price = form.getValues("price") || 0;

                                                if (colors.length === 0) {
                                                    toast.error("Please select at least one color first!");
                                                    return;
                                                }

                                                const newVariants = [];
                                                // If sizes selected, combine. Else just colors? 
                                                if (sizes.length > 0) {
                                                    for (const color of colors) {
                                                        for (const size of sizes) {
                                                            newVariants.push({
                                                                name: `${color} - ${size}`,
                                                                price: price,
                                                                stock: 0,
                                                                variantName: "",
                                                                variantDescription: ""
                                                            });
                                                        }
                                                    }
                                                } else {
                                                    // Just colors
                                                    for (const color of colors) {
                                                        newVariants.push({
                                                            name: color,
                                                            price: price,
                                                            stock: 0
                                                        });
                                                    }
                                                }

                                                form.setValue("variants", newVariants);
                                                toast.success(`Generated ${newVariants.length} variants!`);
                                            }}
                                        >
                                            ⚡ Auto-Generate Variants
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Variants List</FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const currentVariants = form.getValues("variants") || [];
                                                form.setValue("variants", [
                                                    ...currentVariants,
                                                    { name: "", price: form.getValues("price"), stock: 0 }
                                                ]);
                                            }}
                                        >
                                            + Add Variant
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {(form.watch("variants") || []).map((variant, index) => (
                                            <div key={index} className="border p-2 rounded bg-background dark:border-gray-700">
                                                <div className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <FormLabel className="text-xs">Name</FormLabel>
                                                        <Input
                                                            value={variant.name}
                                                            onChange={(e) => {
                                                                const newVariants = [...(form.getValues("variants") || [])];
                                                                if (newVariants[index]) {
                                                                    newVariants[index].name = e.target.value;
                                                                    form.setValue("variants", newVariants);
                                                                }
                                                            }}
                                                            placeholder="e.g. XL, 128GB"
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <FormLabel className="text-xs">Price</FormLabel>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            value={variant.price === 0 ? "" : variant.price}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const num = val === "" ? 0 : Number(val);
                                                                if (!isNaN(num) && num >= 0) {
                                                                    const newVariants = [...(form.getValues("variants") || [])];
                                                                    if (newVariants[index]) {
                                                                        newVariants[index].price = num;
                                                                        form.setValue("variants", newVariants);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <FormLabel className="text-xs">Stock</FormLabel>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            value={variant.stock === 0 ? "" : variant.stock}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const num = val === "" ? 0 : Number(val);
                                                                if (!isNaN(num) && num >= 0) {
                                                                    const newVariants = [...(form.getValues("variants") || [])];
                                                                    if (newVariants[index]) {
                                                                        newVariants[index].stock = num;
                                                                        form.setValue("variants", newVariants);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="mb-0.5"
                                                        onClick={() => {
                                                            const newVariants = [...(form.getValues("variants") || [])];
                                                            newVariants.splice(index, 1);
                                                            form.setValue("variants", newVariants);
                                                        }}
                                                    >
                                                        <span className="sr-only">Delete</span>
                                                        <span aria-hidden="true">×</span>
                                                    </Button>
                                                </div>

                                                {/* Extended Metadata Toggle */}
                                                <div className="mt-2">
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <div>
                                                            <FormLabel className="text-xs text-muted-foreground">Override Name (Optional)</FormLabel>
                                                            <Input
                                                                className="h-8 text-sm"
                                                                placeholder="e.g. Xiaomi 15 Ultra"
                                                                value={variant.variantName || ""}
                                                                onChange={(e) => {
                                                                    const newVariants = [...(form.getValues("variants") || [])];
                                                                    if (newVariants[index]) {
                                                                        newVariants[index].variantName = e.target.value;
                                                                        form.setValue("variants", newVariants);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <FormLabel className="text-xs text-muted-foreground">Override Description (Optional)</FormLabel>
                                                            <Input
                                                                className="h-8 text-sm"
                                                                placeholder="Short description override..."
                                                                value={variant.variantDescription || ""}
                                                                onChange={(e) => {
                                                                    const newVariants = [...(form.getValues("variants") || [])];
                                                                    if (newVariants[index]) {
                                                                        newVariants[index].variantDescription = e.target.value;
                                                                        form.setValue("variants", newVariants);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <FormDescription>
                                        Define specific options with their own price and stock.
                                    </FormDescription>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default EditProductPage;
