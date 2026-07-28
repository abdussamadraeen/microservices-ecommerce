"use client";

import { Search, X, Loader2, ShoppingBag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ProductType } from "@repo/types";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

const SearchBar = () => {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [results, setResults] = useState<ProductType[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  // Sync with URL params
  useEffect(() => {
    setValue(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  // Fetch results when debounced value changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedValue.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?search=${encodeURIComponent(debouncedValue)}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedValue]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim()) {
      const params = new URLSearchParams(searchParams);
      params.delete("search");
      router.push(`/products?${params.toString()}`, { scroll: false });
      setIsFocused(false);
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set("search", value);
    router.push(`/products?${params.toString()}`, { scroll: false });
    setIsFocused(false);
  };

  const clearSearch = () => {
    setValue("");
    setResults([]);
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    router.push(`/products?${params.toString()}`, { scroll: false });
    inputRef.current?.focus();
  };

  const getProductImage = (product: ProductType): string => {
    try {
      if (!product.images) return "/placeholder.png";
      const imgMap = product.images as Record<string, string | string[]>;

      // Try first color
      if (product.colors && product.colors.length > 0) {
        const firstColor = product.colors[0];
        if (firstColor) {
          const img = imgMap[firstColor];
          if (Array.isArray(img) && img.length > 0) {
            const v = img[0];
            if (typeof v === "string") return v;
          }
          if (typeof img === "string" && img) return img;
        }
      }

      // Fallback to any image
      const allImages = Object.values(imgMap).flat();
      const found = allImages.find(img => typeof img === "string" && img);
      return (found as string) || "/placeholder.png";
    } catch (e) {
      return "/placeholder.png";
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full max-w-[500px] z-50`}>
      {/* Search Input Container */}
      <div className={`relative group transition-all duration-300 ease-out ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
        {/* Glow Effect */}
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-full blur opacity-0 transition-opacity duration-500 ${isFocused ? 'opacity-30' : 'opacity-0'}`}
        />

        <form
          onSubmit={handleSearch}
          className={`relative flex items-center w-full h-12 rounded-full border transition-all duration-300 overflow-hidden
          ${isFocused
              ? 'bg-background shadow-xl shadow-primary/10 ring-1 ring-primary/20 border-primary/30'
              : 'bg-muted/40 border-transparent hover:bg-muted/60 hover:border-border/50'
            }`}
        >
          <div className="pl-5 pr-3 text-muted-foreground group-focus-within:text-primary transition-colors">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Search className={`w-5 h-5 transition-transform duration-300 ${isFocused ? 'scale-110' : 'scale-100'}`} />
            )}
          </div>

          <input
            ref={inputRef}
            id="search"
            autoComplete="off"
            value={value}
            placeholder="Search products..."
            className="flex-1 h-full bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground/70 font-medium w-full min-w-0"
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />

          {value && (
            <button
              type="button"
              onClick={clearSearch}
              className="pr-5 pl-3 text-muted-foreground hover:text-foreground transition-colors outline-none animate-in fade-in zoom-in duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>

      {/* Instant Results Dropdown */}
      {isFocused && (value || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-background/80 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
          {results.length > 0 ? (
            <>
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Products
                </div>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-primary/5 hover:scale-[1.01] transition-all duration-200 group"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.categorySlug}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-primary whitespace-nowrap">
                      {formatPrice(product.price)}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-border/50 p-2 bg-muted/30">
                <button
                  onClick={() => handleSearch()}
                  className="w-full py-2.5 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  View all {results.length === 5 ? "results" : `${results.length} results`}
                  <span className="text-xs opacity-50">Press Enter</span>
                </button>
              </div>
            </>
          ) : (
            !isLoading && debouncedValue && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">No products found</p>
                <p className="text-xs opacity-60 mt-1">Try searching for something else</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
