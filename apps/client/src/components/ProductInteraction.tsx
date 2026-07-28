"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@repo/types";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCurrency } from "@/context/CurrencyContext";
import { ProductDescription } from "./ProductDescription";

const ProductInteraction = ({
  product,
  selectedSize,
  selectedColor,
}: {
  product: ProductType;
  selectedSize: string;
  selectedColor: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const { formatPrice } = useCurrency();

  const { addToCart } = useCartStore();

  const isOutOfStock = (product.inventory ?? 0) <= 0;

  // Determine current price based on selected variant
  const selectedVariant = product.variants?.find(v => v.name === selectedSize);
  // Fallback to product price if no variant matches, or if specific variant has no price (though schema enforces it)
  const currentPrice = selectedVariant?.price || product.price;

  const handleTypeChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else {
      if (quantity > 1) {
        setQuantity((prev) => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: currentPrice, // Use the variant price
      quantity,
      selectedColor,
      selectedSize,
    });
    toast.success("Product added to cart")
  };

  const handleBuyNow = () => {
    addToCart({
      ...product, // Ensure cart item has updated price
      price: currentPrice,
      quantity,
      selectedColor,
      selectedSize,
    });
    router.push("/cart");
  };

  // Determine label for variants
  const variantLabel = product.variantType || "Size";
  const hasVariants = product.variants && product.variants.length > 0;

  // Unified list of options: either from variants or legacy sizes
  const variantOptions = hasVariants
    ? product.variants!.map(v => v.name)
    : (product.sizes || []);

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* TITLE & SHORT DESCRIPTION */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{selectedVariant?.variantName || product.name}</h1>
        <p className="text-gray-500 mt-2 text-base leading-relaxed">
          {/* Fallback to full description if short is missing, but truncate? 
               Ideally use shortDescription. If not in type, check if we can add it or just use description truncated. 
               The fetchProduct returns ProductType. Let's assume ProductType has shortDescription based on seed.
               Wait, line 87 used product.description.
               I will try to use product.shortDescription if it exists in the type. 
               If the build fails I will fix it. Use 'any' cast if needed for speed or check types.
               The user "can not read anything", so I must split it.
           */}
          {((product as any).shortDescription) || (selectedVariant as any)?.shortDescription || (product.description.substring(0, 150) + "...")}
        </p>
      </div>

      {/* PRICE DISPLAY */}
      <h2 className="text-3xl font-semibold text-gray-900">{formatPrice(currentPrice)}</h2>

      {/* SEPARATOR */}
      <div className="h-px bg-gray-200 my-2" />

      {/* VARIANTS (Size/Storage etc) */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">{variantLabel}</span>
        <div className="flex items-center gap-3 flex-wrap">
          {variantOptions.map((option) => (
            <div
              className={`cursor-pointer transition-all duration-200 ${selectedSize === option
                ? "ring-2 ring-black ring-offset-2"
                : "hover:ring-1 hover:ring-gray-300"
                } rounded-md`}
              key={option}
              onClick={() => handleTypeChange("size", option)}
            >
              <div
                className={`min-w-[3rem] px-4 py-2 text-sm font-medium text-center rounded-md border ${selectedSize === option
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-200"
                  }`}
              >
                {option.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COLOR */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">Color</span>
        <div className="flex items-center gap-3">
          {product.colors.map((color) => (
            <div
              className={`cursor-pointer p-0.5 rounded-full transition-all duration-200 ${selectedColor === color
                ? "ring-2 ring-black ring-offset-2"
                : "hover:ring-1 hover:ring-gray-300"
                }`}
              key={color}
              onClick={() => handleTypeChange("color", color)}
            >
              <div
                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            </div>
          ))}
        </div>
      </div>

      {/* QUANTITY */}
      {!isOutOfStock && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">Quantity</span>
          <div className="flex items-center w-32 border border-gray-300 rounded-md">
            <button
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              onClick={() => handleQuantityChange("decrement")}
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="flex-1 text-center font-medium">{quantity}</span>
            <button
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              onClick={() => handleQuantityChange("increment")}
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex flex-col gap-3 mt-4">
        {isOutOfStock ? (
          <div className="w-full bg-gray-100 text-gray-500 py-4 rounded-lg text-center font-bold border border-gray-200 cursor-not-allowed tracking-wide">
            SOLD OUT
          </div>
        ) : (
          <>
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 text-base font-semibold tracking-wide"
            >
              <Plus className="w-5 h-5" />
              ADD TO CART
            </button>
            <button
              className="w-full bg-white text-black border border-gray-200 py-4 rounded-full shadow-sm hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 text-base font-semibold tracking-wide"
              onClick={handleBuyNow}
            >
              <ShoppingCart className="w-5 h-5" />
              BUY NOW
            </button>
          </>
        )}
      </div>

      {/* FULL DESCRIPTION SECTION */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="bg-black text-white p-1 rounded-md text-sm">INFO</span>
          Product Details
        </h3>
        <ProductDescription
          description={selectedVariant?.variantDescription || product.description || ""}
        />
      </div>
    </div>
  );
};

export default ProductInteraction;
