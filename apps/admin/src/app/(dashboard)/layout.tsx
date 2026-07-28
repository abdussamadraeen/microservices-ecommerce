import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { ToastContainer } from "react-toastify";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <QueryProvider>
      <CurrencyProvider>
        <div className="flex">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar />
              <main className="w-full">
                <Navbar />
                <div className="px-4">{children}</div>
              </main>
            </SidebarProvider>
          </ThemeProvider>
        </div>
        <ToastContainer position="bottom-right" />
      </CurrencyProvider>
    </QueryProvider>
  );
}
