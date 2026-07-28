"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@repo/types";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ColorSwatch from "./ColorSwatch";
import { useCurrency } from "@/context/CurrencyContext";

const ProductCard = ({ product }: { product: ProductType }) => {
  const { formatPrice } = useCurrency();

  // Determine if we have variants or legacy sizes
  const hasVariants = product.variants && product.variants.length > 0;

  // Initial values
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(
    hasVariants ? product.variants![0]!.name : (product.sizes?.[0] || "")
  );

  const { addToCart } = useCartStore();

  // Find selected variant object if applicable
  const selectedVariant = hasVariants
    ? product.variants?.find(v => v.name === selectedSize)
    : null;

  // Dynamic Price
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  // Handler for Size/Variant change
  const handleSizeChange = (val: string) => {
    setSelectedSize(val);
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: currentPrice,
      quantity: 1,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
    });
    toast.success("Product added to cart");
  };

  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images for selected color
  // const imgMap = product.images as Record<string, string | string[]>;
  // const rawImages = imgMap?.[selectedColor];
  // const images = Array.isArray(rawImages) ? rawImages : [rawImages].filter(Boolean) as string[];

  // FIX: Handle both Array and Record types for images
  const imgData = product.images;
  let images: string[] = [];

  if (Array.isArray(imgData)) {
    images = imgData as string[];
  } else if (typeof imgData === 'object' && imgData !== null) {
    const imgMap = imgData as Record<string, string | string[]>;
    const rawImages = imgMap?.[selectedColor];
    images = Array.isArray(rawImages) ? rawImages : [rawImages].filter(Boolean) as string[];
  }

  // Cycle images on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 800);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
    <div className="group relative flex flex-col bg-white/80 backdrop-blur-md rounded-2xl transition-all duration-500 overflow-hidden h-full hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)] border border-transparent hover:border-amber-200/50 ring-0 hover:ring-2 hover:ring-amber-100/50">

      {/* Legendary Glow Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-100/20 group-hover:via-amber-50/10 group-hover:to-transparent transition-all duration-700 pointer-events-none" />

      {/* IMAGE CONTAINER */}
      <Link href={`/products/${product.id}`} className="block relative aspect-[4/5] bg-gray-50 overflow-hidden rounded-t-xl">
        <div
          className="w-full h-full relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {images.length > 0 ? (
            <Image
              src={images[currentImageIndex] || images[0] || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50 uppercase text-xs font-bold tracking-wider">
              No Image
            </div>
          )}

          {/* Quick Add Overlay (Desktop) - Gold Button */}
          <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] opacity-0 group-hover:opacity-100 hidden md:flex delay-75">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-3 rounded-xl font-bold text-sm hover:from-amber-600 hover:to-yellow-600 shadow-xl hover:shadow-amber-500/20 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10"
            >
              <ShoppingCart className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>
      </Link>

      {/* DETAILS */}
      <div className="flex flex-col flex-1 p-5 gap-3 relative z-10">
        {/* Title & Price */}
        <div className="space-y-1">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-amber-600 transition-colors line-clamp-1" title={product.name}>
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em] font-medium">{product.shortDescription}</p>
        </div>

        {/* Options Row */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-gray-100/50 group-hover:border-amber-100 transition-colors">
          {/* Variant/Size Selector */}
          {(hasVariants || (product.sizes && product.sizes.length > 0)) ? (
            <div className="flex flex-col gap-1 min-w-[40%]">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider group-hover:text-amber-500/70 transition-colors">
                {product.variantType || "Size"}
              </span>
              <select
                value={selectedSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50/80 hover:bg-white border-transparent hover:border-amber-200 rounded-lg py-1.5 pl-2 pr-6 focus:ring-1 focus:ring-amber-500 cursor-pointer transition-all shadow-sm"
              >
                {hasVariants
                  ? product.variants!.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))
                  : product.sizes?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))
                }
              </select>
            </div>
          ) : <div />}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider group-hover:text-amber-500/70 transition-colors">Color</span>
              <div className="flex -space-x-1.5 hover:space-x-1 transition-all">
                {product.colors.slice(0, 4).map(color => (
                  <div
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-110 hover:z-10 ${selectedColor === color ? 'ring-2 ring-amber-400 scale-110 z-10' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {product.colors.length > 4 && (
                  <div className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                    +{product.colors.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Price & Mobile Add */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-xl font-black text-foreground group-hover:text-amber-600 transition-colors tracking-tight">
              {formatPrice(currentPrice)}
            </span>
            {selectedVariant && selectedVariant.price !== product.price && (
              <span className="text-[10px] text-gray-400 line-thru font-medium">From {formatPrice(product.price)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="md:hidden bg-black text-white p-2.5 rounded-xl active:scale-90 transition-transform shadow-lg"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
