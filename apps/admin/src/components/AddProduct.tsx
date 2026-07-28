"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { CategoryType, colors, ProductFormSchema, sizes, clothingSizes, shoeSizes, numericSizes, storageSizes } from "@repo/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";
import { ColorPicker } from "./ColorPicker";
import { useEffect } from "react";

// Categories that truly don't need any size/capacity option
const CATEGORIES_WITHOUT_SIZES = ['accessories', 'cameras', 'watches', 'bags', 'smart-home'];
// Keywords for categories that use storage (GB/TB)
const STORAGE_CATEGORY_KEYWORDS = ['phone', 'tablet', 'laptop', 'electronics', 'console'];
// Keywords for shoe sizes
const SHOE_KEYWORDS = ['shoe', 'footwear', 'sneaker', 'boot', 'sandal', 'heel', 'slipper'];

const fetchCategories = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/categories`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch categories!");
  }

  return await res.json();
};

const AddProduct = () => {
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      inventory: 0,
      categorySlug: "",
      sizes: [],
      colors: [],
      images: {},
      variants: [],
      variantType: "Size",
    },
  });

  // Watch for category changes to conditionally hide sizes
  const selectedCategorySlug = form.watch("categorySlug") || "";
  const variants = form.watch("variants");

  // Sync inventory with variants stock
  useEffect(() => {
    if (variants && variants.length > 0) {
      const totalStock = variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
      form.setValue("inventory", totalStock);
    }
  }, [variants, form]);

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

  const { isPending, error, data } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof ProductFormSchema>) => {
      console.log("Submitting product data:", data);
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products`;
      const res = await fetch(
        url,
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create product!" }));
        console.error("Product creation failed:", errorData);
        throw new Error(errorData.message || "Failed to create product!");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast.success("Product created successfully");
      form.reset();
      window.location.reload();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(error.message);
    },
  });

  return (
    <SheetContent className="sm:max-w-2xl w-full">
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Product</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(
                  (data) => {

                    // Validate that all colors have images
                    const missingImages = data.colors.filter((color: string) => {
                      const image = data.images?.[color];
                      if (!image) return true;
                      if (Array.isArray(image) && image.length === 0) return true;
                      return false;
                    });

                    if (missingImages.length > 0) {
                      toast.error(`Please upload images for: ${missingImages.join(", ")}`);
                      return;
                    }

                    mutation.mutate(data);
                  },
                  (errors) => {
                    console.error("Form Validation Errors:", errors);
                    if (errors.images) {
                      toast.error((errors.images as any)?.message || "Image validation failed");
                    } else if (errors.variants) {
                      toast.error("Please check variants. Name, Price, and Stock are required for all variants.");
                    } else {
                      const errorFields = Object.keys(errors).join(", ");
                      toast.error(`Please check these fields: ${errorFields}`);
                    }
                  }
                )}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the short description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormDescription>
                        Enter the price of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          disabled={variants && variants.length > 0}
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
                      <FormDescription>
                        Stock quantity (0 = Sold Out)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isPending || !!error}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isPending
                                  ? "Loading categories..."
                                  : "Select a category"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {data &&
                              (data || [])
                                .filter((cat: any) => !cat.parentId || (cat.children && cat.children.length > 0))
                                .map((cat: any, catIndex: number) =>
                                  cat.children && cat.children.length > 0 ? (
                                    <SelectGroup
                                      key={`group-${catIndex}-${cat.slug}`}
                                    >
                                      <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-gray-50">
                                        {cat.name}
                                      </SelectLabel>
                                      {cat.children.map(
                                        (child: any, childIndex: number) => (
                                          <SelectItem
                                            key={`child-${catIndex}-${childIndex}-${child.slug}-${child.id}`}
                                            value={child.slug}
                                            className="pl-6"
                                          >
                                            {child.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectGroup>
                                  ) : (
                                    <SelectItem
                                      key={`item-${catIndex}-${cat.slug}`}
                                      value={cat.slug}
                                    >
                                      {cat.name}
                                    </SelectItem>
                                  )
                                )}
                            {(!data || data.length === 0) && !isPending && !error && (
                              <div className="p-2 text-sm text-muted-foreground">
                                No categories found
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Enter the category of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <div className="">
                          {form.watch("colors")?.map((color) => (
                            <div
                              className="mb-4 flex items-center gap-4"
                              key={color}
                            >
                              <div className="flex items-center gap-2">
                                {/* Dynamic color swatch */}
                                <span
                                  className="w-4 h-4 rounded-full inline-block border border-gray-200 dark:border-gray-700"
                                  style={{ backgroundColor: color }}
                                  aria-hidden="true"
                                />
                                <span className="text-sm font-medium min-w-[80px]">
                                  {color}:
                                </span>
                              </div>
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={async (e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    try {
                                      const uploadPromises = Array.from(files).map(async (file) => {
                                        const formData = new FormData();
                                        formData.append("file", file);
                                        formData.append(
                                          "upload_preset",
                                          "ecommerce"
                                        );

                                        const res = await fetch(
                                          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                                          {
                                            method: "POST",
                                            body: formData,
                                          }
                                        );
                                        return res.json();
                                      });

                                      const results = await Promise.all(uploadPromises);
                                      const newUrls = results
                                        .map((data) => {
                                          if (!data.secure_url) {
                                            console.error("Cloudinary error:", data);
                                            toast.error(data.error?.message || "Upload failed!");
                                            return null;
                                          }
                                          return data.secure_url;
                                        })
                                        .filter(Boolean);

                                      if (newUrls.length > 0) {
                                        const currentImages =
                                          form.getValues("images") || {};

                                        // Merge with existing if needed, or replace. 
                                        // For now, replacing seems easier for this input, but user might want to add.
                                        // Let's assume we replace or we could concat. 
                                        // The user said "slider for addming more images", implies multiple.

                                        form.setValue("images", {
                                          ...currentImages,
                                          [color]: newUrls,
                                        });
                                        toast.success(`${newUrls.length} images uploaded for ${color}`);
                                      }
                                    } catch (error) {
                                      console.log(error);
                                      toast.error("Upload failed!");
                                    }
                                  }
                                }}
                              />
                              {field.value?.[color] ? (
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                  ✓ {Array.isArray(field.value[color])
                                    ? `${field.value[color].length} images uploaded`
                                    : "Image uploaded"}
                                </span>
                              ) : (
                                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                                  ⚠ Image required
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => { }}
                >
                  {mutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
