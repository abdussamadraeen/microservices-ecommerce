"use client";

import { CategoryType, ProductType } from "@repo/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories, getProductsByCategory } from "@/actions/product";

// Types
interface ExtendedCategoryType extends CategoryType {
  children?: CategoryType[];
}

interface NavMegaMenuProps {
  activeCategorySlug: string | null;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NavMegaMenu = ({ activeCategorySlug, isVisible, onMouseEnter, onMouseLeave }: NavMegaMenuProps) => {
  const [categories, setCategories] = useState<ExtendedCategoryType[]>([]);
  const [selectedMainCat, setSelectedMainCat] = useState<ExtendedCategoryType | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<CategoryType | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Categories Hierarchy on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data) {
          // Cast strictly if needed, but for now assuming data shape is compatible or 'any' sufficient for this refactor step
          setCategories(data as unknown as ExtendedCategoryType[]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // 2. Handle activeCategorySlug change
  useEffect(() => {
    if (!activeCategorySlug) {
      setSelectedMainCat(null);
      setProducts([]); // Clear products when closed?
      return;
    }

    const mainCat = categories.find((c) => c.slug === activeCategorySlug);
    if (!mainCat) return;

    setSelectedMainCat(mainCat);

    // Default Subcategory Selection Logic
    if (mainCat.children && mainCat.children.length > 0) {
      if (activeCategorySlug === "phones") {
        // Prefer "Xiaomi Series" for Phones
        const xiaomi = mainCat.children.find((c) => c.slug === "xiaomi-series");
        setSelectedSubCat(xiaomi || mainCat.children[0] || null);
      } else {
        setSelectedSubCat(mainCat.children[0] || null);
      }
    } else {
      setSelectedSubCat(mainCat); // Fallback to itself parent is leaf
    }
  }, [activeCategorySlug, categories]);

  // 3. Fetch Products when SubCategory Changes
  useEffect(() => {
    if (!selectedSubCat || !isVisible) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {

        const data = await getProductsByCategory(selectedSubCat.slug, 4);

        if (data) {
          // We need to map Prisma Product to ProductType if needed, especially images
          // The component handles images robustly, so direct set might work if types align roughly
          setProducts(data as unknown as ProductType[]);
        }
      } catch (error) {
        console.error("Menu fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedSubCat, isVisible]);

  if (!isVisible || !selectedMainCat) return null;

  return (
    <div
      className="absolute top-full left-0 w-full bg-white border-t border-b border-primary/10 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-300"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Helper: Show Subcategory Tabs if > 1 child */}
        {selectedMainCat.children && selectedMainCat.children.length > 0 && (
          <div className="flex justify-center mb-8 gap-8">
            {selectedMainCat.children.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCat(sub)}
                className={`text-sm uppercase tracking-wide px-2 pb-1 border-b-2 transition-all ${selectedSubCat?.id === sub.id
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-40 h-40 bg-gray-100 rounded-lg" />
                <div className="w-24 h-4 bg-gray-100 rounded" />
                <div className="w-16 h-4 bg-gray-100 rounded" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className="group flex flex-col items-center text-center gap-4 p-4 rounded-2xl border border-transparent hover:border-black/5 hover:bg-white hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-out"
              >
                <div className="relative w-40 h-40 md:w-48 md:h-48 overflow-hidden rounded-xl bg-gray-50/50">
                  {(() => {
                    let src = "";

                    if (Array.isArray(product.images)) {
                      // Case: simple string[] from seed
                      src = product.images[0] as string;
                    } else if (product.images && typeof product.images === 'object') {
                      // Case: Record<string, string | string[]>
                      const values = Object.values(product.images);
                      if (values.length > 0) {
                        const val = values[0];
                        if (Array.isArray(val)) {
                          src = String(val[0]) || "";
                        } else {
                          src = String(val) || "";
                        }
                      }
                    }

                    if (!src || src.trim() === "") {
                      return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-300">No Image</div>;
                    }

                    return (
                      <Image
                        src={src}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    )
                  })()}
                </div>
                <div>
                  <h3 className="text-foreground font-medium text-lg leading-tight group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                  <p className="text-primary font-semibold mt-2 tracking-wide">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-10 text-gray-400">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavMegaMenu;
