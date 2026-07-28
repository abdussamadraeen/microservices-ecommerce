"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BannerType } from "@repo/types";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit } from "lucide-react";
import AddBanner from "@/components/AddBanner";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";

const BannersPage = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery<BannerType[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/banners`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
        const token = await getToken();
        await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/banners/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["banners"] });
        toast.success("Banner deleted");
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Sheet>
            <SheetTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Banner
                </Button>
            </SheetTrigger>
            <AddBanner />
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners?.map((banner) => (
            <div key={banner.id} className="border rounded-lg overflow-hidden shadow-sm relative group">
                <div className="relative aspect-[2/1]">
                    <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                </div>
                <div className="p-4 bg-white dark:bg-slate-950">
                    <h3 className="font-bold text-lg">{banner.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{banner.link}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                         {/* @ts-ignore */}
                        {banner.showTitle ? "Title Visible" : "Title Hidden"}
                    </p>
                </div>

                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Sheet>
                        <SheetTrigger asChild>
                            <button className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shadow-sm">
                                <Edit className="w-4 h-4" />
                            </button>
                        </SheetTrigger>
                        <AddBanner bannerToEdit={banner} />
                    </Sheet>
                    
                    <button
                        onClick={() => {
                            if (confirm("Are you sure?")) {
                                deleteMutation.mutate(banner.id);
                            }
                        }}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-sm"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            </div>
        ))}
        {banners?.length === 0 && (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
                No banners found. Add one to get started.
            </div>
        )}
      </div>
    </div>
  );
};

export default BannersPage;
