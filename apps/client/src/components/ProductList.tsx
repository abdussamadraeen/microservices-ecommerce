import { ProductsType, ProductType } from "@repo/types";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Filter from "./Filter";

const fetchData = async ({
  category,
  sort,
  search,
  params,
}: {
  category?: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?${category && category !== "all" ? `category=${category}` : ""}${search ? `&search=${search}` : ""}&sort=${sort || "newest"}${params === "homepage" ? "&limit=8" : ""}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error("Failed to fetch products:", res.status, res.statusText);
      return [];
    }

    const data: ProductType[] = await res.json();

    if (!Array.isArray(data)) {
      console.error("Products API returned non-array data:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
const ProductList = async ({
  category,
  sort,
  search,
  params,
}: {
  category: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  const products = await fetchData({ category, sort, search, params });
  return (
    <div className="w-full">
      <Categories />
      {params === "products" && <Filter />}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Link
        href={category ? `/products/?category=${category}` : "/products"}
        className="flex justify-end mt-4 underline text-sm text-gray-500"
      >
        View all products
      </Link>
    </div>
  );
};

export default ProductList;
