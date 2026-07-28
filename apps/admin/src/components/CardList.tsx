"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderType, ProductsType } from "@repo/types";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, TrendingUp, User } from "lucide-react";

const ProductImage = ({ item }: { item: any }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Logic matched from columns.tsx
    const firstColor = item.colors?.[0];
    const imageEntry = firstColor ? (item.images as Record<string, string | string[]>)?.[firstColor] : null;

    let imageUrl = "";
    if (Array.isArray(imageEntry)) {
      imageUrl = imageEntry[0] || "";
    } else if (typeof imageEntry === "string") {
      imageUrl = imageEntry;
    }

    // Fallback to simple object value check if color logic fails (for robustness)
    if (!imageUrl && item.images) {
      if (typeof item.images === "string") return item.images;
      if (Array.isArray(item.images)) return item.images[0] || "/placeholder.png";
      const val = Object.values(item.images)[0];
      if (typeof val === "string") return val;
      if (Array.isArray(val)) return val[0] || "/placeholder.png";
    }

    return imageUrl || "/placeholder.png";
  });

  return (
    <Image
      src={imgSrc}
      alt={item.name}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-500"
      onError={() => setImgSrc("/placeholder.png")}
    />
  );
};

const CardList = ({ title }: { title: string }) => {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: [title === "Popular Products" ? "popular-products" : "recent-orders"],
    queryFn: async () => {
      if (title === "Popular Products") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?limit=5&popular=true`
        );
        if (!res.ok) return [];
        return res.json();
      } else {
        const token = await getToken();
        if (!token) return [];
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) return [];
        return res.json();
      }
    },
  });

  const products: ProductsType = title === "Popular Products" ? (Array.isArray(data) ? data : []) : [];
  const orders: OrderType[] = title !== "Popular Products" ? (Array.isArray(data) ? data : []) : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="">
        <h1 className="text-lg font-medium mb-6 text-glow-sm">{title}</h1>
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-white/5 animate-pulse rounded-lg border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6 text-glow-sm bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-white/50 bg-clip-text text-transparent">{title}</h1>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {title === "Popular Products" ? (
          products.length === 0 ? (
            <p className="text-muted-foreground text-sm">No products found.</p>
          ) : (
            products.map((item) => (
              <motion.div key={item.id} variants={itemAnim} whileHover={{ scale: 1.02, x: 5 }}>
                <Card className="flex-row items-center justify-between gap-4 p-4 glass-panel border-white/5 hover:border-indigo-500/30 transition-colors group cursor-pointer overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1s_infinite]" />
                  <div className="w-12 h-12 rounded-lg relative overflow-hidden border border-white/10 shadow-inner">
                    <ProductImage item={item} />
                  </div>
                  <CardContent className="flex-1 p-0 z-10">
                    <CardTitle className="text-sm font-medium text-slate-800 dark:text-white/90 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                      {item.name}
                    </CardTitle>
                  </CardContent>
                  <CardFooter className="p-0 z-10">
                    <span className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">₹{item.price.toLocaleString("en-IN")}</span>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )
        ) : (
          orders.map((item) => (
            <motion.div key={item._id} variants={itemAnim} whileHover={{ scale: 1.02, x: 5 }}>
              <Card className="flex-row items-center justify-between gap-4 p-4 glass-panel border-white/5 hover:border-emerald-500/30 transition-colors group cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-[shimmer_1s_infinite]" />
                <CardContent className="flex-1 p-0 z-10 overflow-hidden">
                  <CardTitle className="text-sm font-medium text-slate-800 dark:text-white/90 group-hover:text-emerald-600 dark:group-hover:text-white transition-colors truncate">
                    {item.email}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={`mt-1 backdrop-blur-md border-none ${item.status?.toLowerCase() === 'pending'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        : item.status?.toLowerCase() === 'failed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      }`}
                  >
                    {item.status}
                  </Badge>
                </CardContent>
                <CardFooter className="p-0 z-10 shrink-0">
                  <span className="font-mono text-emerald-600 dark:text-emerald-300 font-bold">₹{(item.amount / 100).toLocaleString("en-IN")}</span>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default CardList;
