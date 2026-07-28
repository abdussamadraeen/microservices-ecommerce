"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/TablePagination";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const handleDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const orderIds = selectedRows.map((row) => (row.original as any)._id);
    
    if (orderIds.length === 0) {
      toast.error("No orders selected");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${orderIds.length} order${orderIds.length > 1 ? 's' : ''}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    const token = await getToken();

    try {
      console.log(`🗑️ Deleting ${orderIds.length} orders...`);
      
      const deletePromises = orderIds.map((id) =>
        fetch(`${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter((res) => !res.ok);

      if (failedDeletes.length > 0) {
        console.error(`❌ Failed to delete ${failedDeletes.length} orders`);
        toast.error(`Failed to delete ${failedDeletes.length} order(s)`);
      } else {
        console.log(`✅ Successfully deleted ${orderIds.length} orders`);
        toast.success(`Deleted ${orderIds.length} order(s) successfully`);
      }

      // Clear selection and refresh
      setRowSelection({});
      router.refresh();
    } catch (error) {
      console.error("❌ Error deleting orders:", error);
      toast.error("Failed to delete orders");
    } finally {
      setIsDeleting(false);
    }
  };

  console.log(rowSelection);
  return (
    <div className="rounded-md border">
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex justify-end">
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-2 py-1 text-sm rounded-md m-4 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4"/>
            {isDeleting ? "Deleting..." : "Delete Payment(s)"}
          </button>
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
