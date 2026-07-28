"use client";

import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  User2,
  ChevronUp,
  Plus,
  Shirt,
  User,
  ShoppingBasket,
  MonitorPlay,
  Layers,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetTrigger } from "./ui/sheet";
import AddOrder from "./AddOrder";
import AddUser from "./AddUser";
import AddCategory from "./AddCategory";
import AddProduct from "./AddProduct";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Banners",
    url: "/banners",
    icon: MonitorPlay,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

// Divine Animation Variants
const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.05
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
} as const;

const glowVariants = {
  hover: {
    boxShadow: "0 0 20px 2px rgba(124, 58, 237, 0.3)", // Purple glow
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

const AppSidebar = () => {
  const [storeName, setStoreName] = useState("Xiaomi India");
  const [storeLogo, setStoreLogo] = useState("/logo.png");
  const { getToken } = useAuth();
  const { setOpen, state, open } = useSidebar();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Load store name from settings
    const loadStoreName = () => {
      const saved = localStorage.getItem("adminSettings");
      if (saved) {
        const settings = JSON.parse(saved);
        setStoreName(settings.storeName || "Xiaomi India");
        setStoreLogo(settings.storeLogo || "/logo.png");
      }
    };

    loadStoreName();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadStoreName();
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener("settingsUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("settingsUpdated", handleStorageChange);
    };
  }, []);

  // Handle hover to temporarily expand when collapsed (only if not pinned)
  const wasCollapsedRef = useRef(false);
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (state === "collapsed") {
      wasCollapsedRef.current = true;
    }
  }, [state]);

  useEffect(() => {
    if (!isPinned) {
      if (state === "collapsed" && isHovered) {
        setOpen(true);
      } else if (wasCollapsedRef.current && !isHovered && open) {
        setOpen(false);
        wasCollapsedRef.current = false;
      }
    }
  }, [isHovered, state, open, setOpen, isPinned]);

  // Detect manual toggle (button click) - now acts as pin/unpin
  useEffect(() => {
    if (prevOpenRef.current !== open && !isHovered) {
      // Manual toggle detected - set pinned state
      setIsPinned(open);
      wasCollapsedRef.current = false;
      setIsHovered(false);
    }
    prevOpenRef.current = open;
  }, [open, isHovered]);

  // Fetch Order Stats for "Real Data" (Optimized)
  const { data: orderStats } = useQuery({
    queryKey: ["order-stats"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30000 // Refresh every 30s
  });

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      return [];
    }
  });

  // Fetch Low Stock for Badge
  const { data: lowStockCount = 0 } = useQuery({
    queryKey: ["sidebar-low-stock"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?lowStock=true`
      );
      if (!res.ok) return 0;
      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    },
    refetchInterval: 60000
  });

  // Calculate Inbox Count (Paid Orders + Low Stock)
  // 'success' status means payment successful -> ready to process
  const paidOrdersCount = orderStats?.success || 0;
  const inboxCount = paidOrdersCount + lowStockCount;

  return (
    <Sidebar
      collapsible="icon"
      className="glass-panel border-r border-white/10 transition-[width] duration-200 ease-out group/sidebar z-50 pointer-events-auto"
      onMouseEnter={() => !isPinned && state === "collapsed" && setIsHovered(true)}
      onMouseLeave={() => !isPinned && setIsHovered(false)}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className="h-full flex flex-col"
      >
        <SidebarHeader className="py-6 px-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover/sidebar:animate-[shimmer_2s_infinite]" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="hover:bg-transparent data-[state=open]:bg-transparent ring-0 focus-visible:ring-0 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0">
                <Link href="/" className="flex items-center gap-3 pl-1 overflow-hidden group-data-[state=collapsed]:pl-0 py-2">
                  <div className="relative w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white border border-border shadow-sm group-data-[state=expanded]:w-8 group-data-[state=expanded]:h-8 group-data-[state=collapsed]:mx-auto overflow-hidden">
                    <Image
                      src={storeLogo}
                      alt="logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain p-0.5"
                      onError={() => {
                        if (storeLogo !== "/default-logo.png") {
                          setStoreLogo("/default-logo.png");
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden group-data-[state=collapsed]:hidden">
                    <span className="font-bold text-lg text-foreground whitespace-nowrap pl-2 block truncate">
                      {storeName}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator className="bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <SidebarContent className="px-2 scrollbar-none group-data-[state=collapsed]:group-hover/sidebar:overflow-visible">

          {/* MAIN MENU */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold text-indigo-600/60 dark:text-indigo-300/60 uppercase tracking-[0.2em] pl-4 py-4 backdrop-blur-sm">Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {[
                  { title: "Dashboard", url: "/", icon: Home, color: "text-blue-400", bg: "bg-blue-500" },
                  { title: "Inbox", url: "/inbox", icon: Inbox, color: "text-purple-400", bg: "bg-purple-500", badge: inboxCount },
                  { title: "Calendar", url: "/calendar", icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-500" },
                  { title: "Search", url: "/search", icon: Search, color: "text-sky-400", bg: "bg-sky-500" },
                  { title: "Banners", url: "/banners", icon: MonitorPlay, color: "text-pink-400", bg: "bg-pink-500" },
                  { title: "Ecosystem", url: "/ecosystem", icon: Layers, color: "text-orange-400", bg: "bg-orange-500" },
                  { title: "Settings", url: "/settings", icon: Settings, color: "text-slate-400", bg: "bg-slate-500" },
                ].map((item, index) => (

                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild className="group/item relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0">
                      <Link href={item.url} className="flex items-center">
                        <item.icon className={`w-5 h-5 ${item.color} group-hover/item:text-white transition-colors duration-300 group-data-[state=collapsed]:mx-auto`} />
                        <span className="font-medium group-hover/item:translate-x-1 transition-transform ml-3 whitespace-nowrap group-hover/item:text-glow-sm group-data-[state=collapsed]:hidden">{item.title}</span>
                        <div className={`absolute inset-y-0 left-0 w-1 ${item.bg} rounded-r-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_currentColor]`} />
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? (
                      item.badge > 0 && (
                        <SidebarMenuBadge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 animate-pulse border-none">
                          {item.badge}
                        </SidebarMenuBadge>
                      )
                    ) : null}
                  </SidebarMenuItem>
                ))}

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* CATALOG GROUP */}
          <SidebarGroup>
            <div className="flex items-center justify-between pr-2">
              <SidebarGroupLabel className="text-[10px] font-bold text-indigo-600/60 dark:text-indigo-300/60 uppercase tracking-[0.2em] pl-4 py-4 backdrop-blur-sm">Catalog</SidebarGroupLabel>
              <SidebarGroupAction className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70 transition-colors" title="Add Product">
                <Sheet>
                  <SheetTrigger asChild>
                    <Plus className="w-4 h-4 cursor-pointer hover:rotate-90 transition-transform duration-300" />
                  </SheetTrigger>
                  <AddProduct />
                </Sheet>
              </SidebarGroupAction>
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {[
                  { title: "Products", url: "/products", icon: Shirt, color: "text-indigo-400", bg: "bg-indigo-500" },
                  { title: "Categories", url: "/categories", icon: Layers, color: "text-teal-400", bg: "bg-teal-500" },
                ].map((item) => (
                  <motion.div key={item.url} variants={itemVariants} whileHover={{ x: 5 }}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="group/item relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0">
                        <Link href={item.url} className="flex items-center">
                          <item.icon className={`w-5 h-5 ${item.color} group-hover/item:text-white transition-colors duration-300 group-data-[state=collapsed]:mx-auto`} />
                          <span className="font-medium group-hover/item:translate-x-1 transition-transform ml-3 whitespace-nowrap group-hover/item:text-glow-sm group-data-[state=collapsed]:hidden">{item.title}</span>
                          <div className={`absolute inset-y-0 left-0 w-1 ${item.bg} rounded-r-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_currentColor]`} />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* PEOPLE GROUP */}
          <SidebarGroup>
            <div className="flex items-center justify-between pr-2">
              <SidebarGroupLabel className="text-[10px] font-bold text-indigo-600/60 dark:text-indigo-300/60 uppercase tracking-[0.2em] pl-4 py-4 backdrop-blur-sm">People</SidebarGroupLabel>
              <SidebarGroupAction className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70 transition-colors" title="Add User">
                <AddUser>
                  <Plus className="w-4 h-4 cursor-pointer hover:rotate-90 transition-transform duration-300" />
                </AddUser>
              </SidebarGroupAction>
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                <motion.div variants={itemVariants} whileHover={{ x: 5 }}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="group/item relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0">
                      <Link href="/users" className="flex items-center">
                        <User className="w-5 h-5 text-rose-400 group-hover/item:text-white transition-colors duration-300 group-data-[state=collapsed]:mx-auto" />
                        <span className="font-medium group-hover/item:translate-x-1 transition-transform ml-3 whitespace-nowrap group-hover/item:text-glow-sm group-data-[state=collapsed]:hidden">Users</span>
                        <div className="absolute inset-y-0 left-0 w-1 bg-rose-500 rounded-r-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_currentColor]" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* SALES GROUP */}
          <SidebarGroup>
            <div className="flex items-center justify-between pr-2">
              <SidebarGroupLabel className="text-[10px] font-bold text-indigo-600/60 dark:text-indigo-300/60 uppercase tracking-[0.2em] pl-4 py-4 backdrop-blur-sm">Sales</SidebarGroupLabel>
              <SidebarGroupAction className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70 transition-colors" title="Add Order">
                <AddOrder>
                  <Plus className="w-4 h-4 cursor-pointer" />
                </AddOrder>
              </SidebarGroupAction>
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                <motion.div variants={itemVariants} whileHover={{ x: 5 }}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="group/item relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0">
                      <Link href="/orders" className="flex items-center">
                        <ShoppingBasket className="w-5 h-5 text-yellow-400 group-hover/item:text-white transition-colors duration-300 group-data-[state=collapsed]:mx-auto" />
                        <span className="font-medium group-hover/item:translate-x-1 transition-transform ml-3 whitespace-nowrap group-hover/item:text-glow-sm group-data-[state=collapsed]:hidden">Orders</span>
                        <div className="absolute inset-y-0 left-0 w-1 bg-yellow-500 rounded-r-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_currentColor]" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-2 text-[10px] text-center text-gray-500/50 hover:text-gray-500 transition-colors cursor-default select-none group-data-[state=collapsed]:hidden">
            Developed by ABDUS SAMAD RAEEN
          </div>
        </SidebarFooter>
      </motion.div>
    </Sidebar>
  );
};

export default AppSidebar;
