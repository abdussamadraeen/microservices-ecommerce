"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Box, Check, Clock, Package, Truck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

const InboxPage = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'action' | 'updates'>('action');

  // Fetch successful (paid) orders needing shipping
  const { data: paidOrders = [] } = useQuery({
    queryKey: ["inbox-paid-orders"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?status=success,processing,pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000,
  });

  // Fetch low stock
  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ["inbox-low-stock"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?lowStock=true`
      );
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 60000,
  });

  // Mutation for Quick Actions
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inbox-paid-orders"] });
      toast.success(`Order marked as ${variables.status}`);
    },
    onError: () => {
      toast.error("Failed to update order status");
    }
  });

  const actionItems = [
    ...paidOrders.map((order: any) => ({
      id: order._id,
      type: "order-ready",
      title: `Order #${order._id.slice(-6).toUpperCase()}`,
      subtitle: `${order.status === 'processing' ? 'Processing' : order.status === 'pending' ? 'Pending' : 'Paid'} by ${order.shippingAddress?.name || order.email}`,
      message: `${order.products?.length || 1} items ready to ship.`,
      time: order.createdAt,
      image: order.products?.[0]?.image,
      link: `/orders/${order._id}?source=inbox`
    })),
    ...lowStockProducts.map((product: any) => ({
      id: product.id,
      type: "low-stock",
      title: "Low Stock Alert",
      subtitle: product.name,
      message: `Only ${product.inventory} units remaining.`,
      time: product.updatedAt || new Date().toISOString(),
      image: product.images && Object.values(product.images).flat()[0],
      link: `/products/${product.id}/edit`
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1">Manage your pending tasks</p>
        </div>
      </div>

      {/* Quick Stats / Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('action')}
          className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'action'
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Action Required
          {actionItems.length > 0 && (
            <span className="ml-2 bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
              {actionItems.length}
            </span>
          )}
          {activeTab === 'action' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'updates'
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Recent Updates
          {activeTab === 'updates' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      <div className="space-y-4 min-h-[400px]">
        {activeTab === 'action' && (
          actionItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
              <Check className="w-12 h-12 mb-4 opacity-20" />
              <p>No pending actions!</p>
            </div>
          ) : (
            actionItems.map((item) => (
              <div key={item.id} className="group bg-white dark:bg-slate-950 border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 relative overflow-hidden">
                {/* Left Accent */}
                <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'order-ready'
                  ? (item.subtitle.includes('Processing') ? 'bg-purple-500' : 'bg-blue-500')
                  : 'bg-amber-500'}`} />

                {/* Icon / Image */}
                <div className="shrink-0">
                  {item.image ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-100 relative">
                      <Image
                        src={item.image}
                        alt="preview"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${item.type === 'order-ready'
                      ? (item.subtitle.includes('Processing') ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600")
                      : "bg-amber-50 text-amber-600"
                      }`}>
                      {item.type === 'order-ready' ? <Package className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                        <Link href={item.link}>{item.title}</Link>
                      </h3>
                      <p className="text-sm font-medium text-foreground/80">{item.subtitle}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {item.type === 'order-ready' && (
                      <>
                        <button
                          onClick={() => statusMutation.mutate({ id: item.id, status: 'shipped' })}
                          disabled={statusMutation.isPending}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
                        >
                          <Truck className="w-4 h-4" />
                          Quick Ship
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: item.id, status: 'cancelled' })}
                          disabled={statusMutation.isPending}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <Link
                      href={item.link}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-foreground hover:bg-gray-100 rounded-lg transition-colors ml-auto"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'updates' && (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No recent system updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
