"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import AddCategory from "@/components/AddCategory";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const fetchCategories = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/categories`,
      { cache: "no-store" } // Ensure real-time data
    );
    if (!res.ok) throw new Error("Failed to fetch categories!");
    return await res.json();
};

const CategoriesPage = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold dark:text-white">Categories</h1>
         <Sheet>
           <SheetTrigger asChild>
             <Button>
               <Plus className="mr-2 h-4 w-4" /> Add Category
             </Button>
           </SheetTrigger>
           <AddCategory />
         </Sheet>
      </div>
      <DataTable columns={columns} data={categories || []} />
    </div>
  );
};

export default CategoriesPage;
