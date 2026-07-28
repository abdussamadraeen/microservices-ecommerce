"use client";

import { CategoryType, ProductType } from "@repo/types";
import { ChevronRight, Tablet, Laptop, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";

// Add children to CategoryType locally since we just updated the backend
// In a real scenario, we'd update @repo/types
interface ExtendedCategoryType extends CategoryType {
  children?: CategoryType[];
}

const ProductShowcase = () => {
  const { formatPrice } = useCurrency();
  const [categories, setCategories] = useState<ExtendedCategoryType[]>([]);
  const [selectedMainCat, setSelectedMainCat] = useState<ExtendedCategoryType | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<CategoryType | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCategoryName = (name: string) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Fetch Categories Structure
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/categories`);
        if (res.ok) {
          const data: ExtendedCategoryType[] = await res.json();
          // Filter for only Top-Level categories (no parentId)
          // Since our type doesn't have parentId yet in frontend (maybe), we rely on children or specific slugs
          // For now, let's filter based on known slugs or just list them all if API returns all
          // Ideally backend returns headers or we filter by parentId=null
          // Assuming the seed created hierarchy, the API returns flat list related to Prisma...
          // Wait, prisma findMany returns everything.
          // We need to filter for roots. If `children` is populated, it's a parent? Not necessarily.
          // Let's filter by checking if it's one of our "Main" tabs options.

          const mainTabs = data.filter(c => ["phones", "tablets", "laptops", "smart-home", "audio"].includes(c.slug));
          setCategories(data); // Keep all for lookup

          // Default to Phones
          const phoneCat = data.find(c => c.slug === "phones");
          if (phoneCat) {
            setSelectedMainCat(phoneCat);
            // Default to first child (Xiaomi Series)
            if (phoneCat.children && phoneCat.children.length > 0) {
              // Sort children?
              const child = phoneCat.children.find(c => c.slug === "xiaomi-series") || phoneCat.children[0];
              setSelectedSubCat(child || null);
            } else {
              setSelectedSubCat(phoneCat); // Fallback to itself if no children
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  // Fetch Products when SubCat changes
  useEffect(() => {
    if (!selectedSubCat) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch products by category slug
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?category=${selectedSubCat.slug}`
        );
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedSubCat]);

  // Handler for clicking a Main Category
  const handleMainClick = (cat: ExtendedCategoryType) => {
    setSelectedMainCat(cat);
    // Select first child or itself
    if (cat.children && cat.children.length > 0) {
      // Prioritize Xiaomi for Phones
      if (cat.slug === 'phones') {
        const xiaomi = cat.children.find(c => c.slug === 'xiaomi-series');
        setSelectedSubCat(xiaomi || cat.children[0] || null);
      } else {
        setSelectedSubCat(cat.children[0] || null);
      }
    } else {
      setSelectedSubCat(cat);
    }
  };

  if (!selectedMainCat) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 my-12 min-h-[500px]">
      {/* Left Sidebar (Main Tabs) */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
        {/* Phones */}
        {categories.filter(c => ["phones", "tablets", "laptops", "smart-home", "audio"].includes(c.slug)).map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleMainClick(cat)}
            className={`text-left px-6 py-3 font-medium text-lg rounded-md transition-colors flex justify-between items-center ${selectedMainCat.slug === cat.slug
              ? "text-orange-500"
              : "text-gray-700 hover:text-gray-900"
              }`}
          >
            {formatCategoryName(cat.name)}
            {selectedMainCat.slug === cat.slug && <ChevronRight className="w-5 h-5" />}
          </button>
        ))}
      </div>

      {/* Right Content Area */}
      <div className="flex-1">
        {/* Top Sub-navigation (if children exist) */}
        {selectedMainCat.children && selectedMainCat.children.length > 0 && (
          <div className="flex gap-8 mb-6 border-b pb-2 overflow-x-auto">
            {selectedMainCat.children.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCat(sub)}
                className={`whitespace-nowrap pb-2 text-base transition-all ${selectedSubCat?.slug === sub.slug
                  ? "text-orange-500 border-b-2 border-orange-500 font-medium"
                  : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                {formatCategoryName(sub.name)}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Skeletons
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            ))
          ) : products.length > 0 ? (
            products.map(product => {
              // Robust Image Extraction Helper
              let imageUrl = "https://placehold.co/600x400?text=No+Image";
              if (Array.isArray(product.images) && product.images.length > 0) {
                imageUrl = product.images[0] as string;
              } else if (product.images && typeof product.images === 'object') {
                // Handle Record<string, string[]> -> just take first available
                const values = Object.values(product.images);
                if (values.length > 0) {
                  const val = values[0];
                  if (Array.isArray(val)) imageUrl = val[0] as string;
                  else if (typeof val === 'string') imageUrl = val;
                }
              }

              return (
                <Link href={`/products/${product.id}`} key={product.id} className="group cursor-pointer block">
                  <div className="bg-gray-50 rounded-xl p-6 mb-4 relative overflow-hidden transition-all duration-300 group-hover:shadow-lg h-60 flex items-center justify-center">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-gray-900 font-medium truncate px-2">{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{product.shortDescription || "Flagship performance"}</p>
                    <p className="text-orange-500 font-medium mt-1">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400">
              No products found in this category.
            </div>
          )}
        </div>

        {/* Bottom Links */}
        <div className="mt-8 flex justify-end gap-6 text-sm">
          <Link href="/?category=accessories" className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            Accessories
          </Link>
          <Link href={`/?category=${selectedMainCat.slug}`} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            All {selectedMainCat.name} Series
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
