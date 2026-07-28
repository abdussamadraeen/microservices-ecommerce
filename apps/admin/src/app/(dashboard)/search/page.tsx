"use client";

import { Package, Search as SearchIcon, ShoppingBag, User, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm] = useDebounce(searchTerm, 500);
  const [activeTab, setActiveTab] = useState("all");
  const { getToken } = useAuth();

  // 1. Search Products
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["search-products", debouncedTerm],
    queryFn: async () => {
      // If no search term, return empty or recent.
      // Current API logic:
      // Product service -> returns recent products if no search.
      // Order service -> returns recent orders if no search.
      // Auth service -> returns recent users if no search (default clerk list).

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?search=${debouncedTerm}&limit=5`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.products || [];
    },
    // Always enabled to show default/recent items
    enabled: true,
  });

  // 2. Search Orders
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["search-orders", debouncedTerm],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?search=${debouncedTerm}&limit=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: true,
  });

  // 3. Search Users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["search-users", debouncedTerm],
    queryFn: async () => {
      // Auth service might be protected or public depending on setup. Assuming public or token specific.
      // Usually auth-service isn't directly exposed to client like this, but via details.
      // If we need token:
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8003'}/users?search=${debouncedTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      // Clerk's getUserList returns { data: User[], totalCount: number } or a PaginatedResource
      return Array.isArray(data) ? data : (data.data || []);
    },
    enabled: true,
  });

  const loading = loadingProducts || loadingOrders || loadingUsers;

  const tabs = [
    { id: "all", label: "All Results" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "users", label: "Users" },
  ];

  const getProductImage = (product: any) => {
    if (product.images && typeof product.images === 'object') {
      const val = Object.values(product.images).flat()[0];
      return typeof val === 'string' ? val : "";
    }
    return "";
  }

  // Helper to determine if we should show a section
  const shouldShow = (sectionData: any[]) => {
    // If we have a search term, only show if we have results.
    // If we DON'T have a search term, show the section (Recent items).
    if (debouncedTerm) return sectionData.length > 0;
    return sectionData.length > 0;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          {debouncedTerm ? "Search Results" : "Explore"}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {debouncedTerm ? `Found results for "${debouncedTerm}"` : "Recent products, orders, and users."}
        </p>
      </div>

      <div className="relative group max-w-3xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-focus-within:opacity-75 transition duration-500" />
        <div className="relative bg-white dark:bg-slate-950 rounded-xl flex items-center shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 overflow-hidden">
          <div className="pl-4 text-gray-400 shrink-0">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : <SearchIcon className="w-6 h-6" />}
          </div>
          <input
            type="text"
            placeholder="Search for products, #order-id, or user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 bg-transparent border-none focus:ring-0 outline-none text-lg placeholder:text-gray-400 dark:text-white min-w-0 flex-1"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="pr-4 shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-800 overflow-x-auto pb-1 sticky top-0 z-10 bg-gray-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all rounded-t-lg relative ${activeTab === tab.id
              ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border-b-2 border-blue-600 dark:border-blue-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-12 min-h-[400px]">
        {/* Products Section */}
        {(activeTab === "all" || activeTab === "products") && shouldShow(products) && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> {debouncedTerm ? "Products" : "Recent Products"}
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full">{products.length}</span>
              </h2>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-slate-900 rounded-2xl animate-pulse" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed">No products found matching "{debouncedTerm}"</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Link href={`/products/${product.id}/edit`} key={product.id} className="block group h-full">
                    <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden group-hover:ring-2 group-hover:ring-blue-500/20">
                      {/* Image */}
                      <div className="w-full aspect-video rounded-xl bg-gray-100 dark:bg-slate-900 relative overflow-hidden mb-4">
                        {getProductImage(product) ? (
                          <Image src={getProductImage(product)} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-slate-700">
                            <Package className="w-12 h-12 opacity-50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.category?.name || "Uncategorized"}</p>
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-900 flex justify-between items-center text-xs font-medium">
                        <div className={`flex items-center gap-1.5 ${product.inventory > 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${product.inventory > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {product.inventory > 0 ? `${product.inventory} Stock` : 'Out of stock'}
                        </div>
                        <span className="text-gray-400 font-mono">#{product.id}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Orders Section */}
        {(activeTab === "all" || activeTab === "orders") && shouldShow(orders) && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-500" /> {debouncedTerm ? "Orders" : "Recent Orders"}
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2.5 py-0.5 rounded-full">{orders.length}</span>
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed">No orders found matching "{debouncedTerm}"</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order: any) => (
                  <Link href={`/orders/${order._id}`} key={order._id} className="block group">
                    <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg hover:border-purple-500/30 transition-all cursor-pointer relative overflow-hidden group-hover:bg-purple-50/50 dark:group-hover:bg-slate-900/50">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'success' ? 'bg-emerald-500' : order.status === 'pending' ? 'bg-amber-500' : 'bg-gray-500'}`} />
                      <div className="flex justify-between items-center pl-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </h3>
                            <span className="text-xs text-gray-400 font-mono">via {order.paymentMethod || 'Online'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{order.shippingAddress?.name || order.email || "Guest User"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold dark:text-white mb-2">₹{(order.amount / 100).toLocaleString('en-IN')}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${order.status === "success"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : order.status === "pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                            }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Users Section */}
        {(activeTab === "all" || activeTab === "users") && shouldShow(users) && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-pink-500" /> {debouncedTerm ? "Users" : "Recent Users"}
                <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs px-2.5 py-0.5 rounded-full">{users.length}</span>
              </h2>
            </div>

            {users.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed">No users found matching "{debouncedTerm}"</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user: any) => (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-lg hover:border-pink-500/30 transition-all flex items-center gap-4 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 shrink-0 ring-2 ring-transparent group-hover:ring-pink-500/20 transition-all overflow-hidden relative">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-pink-600 transition-colors">
                            {user.firstName || "User"} {user.lastName}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate">{user.emailAddresses?.[0]?.emailAddress}</p>
                        </div>
                        {/* Mock status indicator */}
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" title="Active" />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="bg-gray-100 dark:bg-slate-900 px-2 py-0.5 rounded">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {!debouncedTerm && !loading && products.length === 0 && orders.length === 0 && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-1000">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 absolute" />
          <SearchIcon className="w-20 h-20 text-gray-200 dark:text-slate-800 mb-6 relative z-10" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">Search the System</h3>
          <p className="text-gray-500 max-w-md mx-auto relative z-10">
            Enter a product name, order ID, or user email to instantly retrieve data from across the microservices ecosystem.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
