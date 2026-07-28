"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ProductType } from "@repo/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

// Component to handle dynamic currency formatting
const PriceCell = ({ price }: { price: number }) => {
  const { formatPrice } = useCurrency();
  return <div className="font-medium">{formatPrice(price)}</div>;
};

export const columns: ColumnDef<ProductType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const product = row.original;

      const firstColor = product.colors?.[0];
      const imageEntry = firstColor ? (product.images as Record<string, string | string[]>)?.[firstColor] : null;

      let imageUrl = "";
      if (Array.isArray(imageEntry)) {
        imageUrl = imageEntry[0] || "";
      } else if (typeof imageEntry === "string") {
        imageUrl = imageEntry;
      }

      if (!imageUrl) {
        return <div className="w-9 h-9 relative bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-[8px] text-gray-500 dark:text-gray-400">No Img</div>;
      }

      return (
        <div className="w-9 h-9 relative">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return <PriceCell price={price} />;
    },
  },
  {
    accessorKey: "inventory",
    header: "Status",
    cell: ({ row }) => {
      const inventory = parseInt(row.getValue("inventory") || "0");
      return (
        <div className={cn("px-2 py-1 rounded-full text-xs w-fit font-medium",
          inventory > 0
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {inventory > 0 ? "In Stock" : "Sold Out"}
        </div>
      )
    }
  },
  {
    accessorKey: "shortDescription",
    header: "Description",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(product.id.toString())
              }
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`http://localhost:3500/products/${product.id}`} target="_blank">View product</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/products/${product.id}/edit`}>Edit Product</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
