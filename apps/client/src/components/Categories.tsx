"use client";

import {
  Smartphone,
  Tablet,
  Tv,
  Watch,
  Headphones,
  Laptop,
  ShoppingBasket,
  Monitor,
  Shirt,
  Footprints,
  Glasses,
  Briefcase,
  Venus,
  Hand,
  ChevronLeft,
  LayoutGrid,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const mainCategories = [
  {
    name: "All",
    icon: <ShoppingBasket className="w-4 h-4" />,
    slug: "all",
  },
  {
    name: "Phones",
    icon: <Smartphone className="w-4 h-4" />,
    slug: "phones",
  },
  {
    name: "Tablets",
    icon: <Tablet className="w-4 h-4" />,
    slug: "tablets",
  },
  {
    name: "TV & Smart Home",
    icon: <Tv className="w-4 h-4" />,
    slug: "smart-home",
  },
  {
    name: "Watches",
    icon: <Watch className="w-4 h-4" />,
    slug: "watches",
  },
  {
    name: "Audio",
    icon: <Headphones className="w-4 h-4" />,
    slug: "audio",
  },
  {
    name: "Laptops",
    icon: <Laptop className="w-4 h-4" />,
    slug: "laptops",
  },
  {
    name: "Monitors",
    icon: <Monitor className="w-4 h-4" />,
    slug: "monitors",
  },
  {
    name: "T-shirts",
    icon: <Shirt className="w-4 h-4" />,
    slug: "t-shirts",
  },
  {
    name: "Shoes",
    icon: <Footprints className="w-4 h-4" />,
    slug: "shoes",
  },
  {
    name: "Accessories",
    icon: <Glasses className="w-4 h-4" />,
    slug: "accessories",
  },
  {
    name: "Bags",
    icon: <Briefcase className="w-4 h-4" />,
    slug: "bags",
  },
  {
    name: "Dresses",
    icon: <Venus className="w-4 h-4" />,
    slug: "dresses",
  },
  {
    name: "Jackets",
    icon: <Shirt className="w-4 h-4" />,
    slug: "jackets",
  },
  {
    name: "Gloves",
    icon: <Hand className="w-4 h-4" />,
    slug: "gloves",
  },
];

const phoneCategories = [
  {
    name: "Back",
    icon: <ChevronLeft className="w-4 h-4" />,
    slug: "all", // Going back resets to All or root
  },
  {
    name: "All Phones",
    icon: <Smartphone className="w-4 h-4" />,
    slug: "phones",
  },
  {
    name: "Xiaomi Series",
    icon: <Smartphone className="w-4 h-4" />,
    slug: "xiaomi-series",
  },
  {
    name: "Redmi Series",
    icon: <Smartphone className="w-4 h-4" />,
    slug: "redmi-series",
  },
  {
    name: "POCO Phones",
    icon: <Smartphone className="w-4 h-4" />,
    slug: "poco-phones",
  },
];

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category");

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Determine which list to show
  // If selected category is 'phones' or one of the phone subcategories, show phone list.
  const isPhoneMode =
    selectedCategory === "phones" ||
    selectedCategory === "xiaomi-series" ||
    selectedCategory === "redmi-series" ||
    selectedCategory === "poco-phones";

  const currentList = isPhoneMode ? phoneCategories : mainCategories;

  return (
    <div className="flex flex-wrap gap-4 bg-background/40 backdrop-blur-sm border border-primary/10 p-4 rounded-lg mb-6 text-sm">
      {currentList.map((category) => (
        <div
          className={`flex items-center justify-center gap-2 cursor-pointer px-4 py-2 rounded-md transition-all duration-200 ${category.slug === selectedCategory ||
            (category.slug === "all" && !selectedCategory && !isPhoneMode)
            ? "bg-primary text-primary-foreground shadow-md font-medium"
            : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:shadow-sm"
            }`}
          key={category.name}
          onClick={() => handleChange(category.slug)}
        >
          {category.icon}
          <span className="whitespace-nowrap">{category.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Categories;
