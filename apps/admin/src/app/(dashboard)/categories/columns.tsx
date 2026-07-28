"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";

export type Category = {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  parent?: {
    name: string;
  };
  _count?: {
    products: number;
  };
};

const ActionCell = ({ category }: { category: Category }) => {
    const { getToken } = useAuth();
    
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                const token = await getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/categories/${category.id}`, {
                     method: 'DELETE',
                     headers: {
                        Authorization: `Bearer ${token}`
                     }
                 });
                 if (!res.ok) throw new Error("Failed to delete");
                 toast.success("Category deleted");
                 window.location.reload();
            } catch (error) {
                toast.error("Failed to delete category");
            }
        }
    };

    return (
        <div className="flex gap-2">
           <Button variant="destructive" size="sm" onClick={handleDelete}>
             <Trash className="h-4 w-4" />
           </Button>
        </div>
    );
};

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "parent.name",
    header: "Parent",
    cell: ({ row }) => {
        return row.original.parent?.name || "-";
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell category={row.original} />,
  },
];
