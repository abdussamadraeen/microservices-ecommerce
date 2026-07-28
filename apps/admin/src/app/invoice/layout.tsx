"use client";

import QueryProvider from "@/components/providers/QueryProvider";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function InvoiceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <CurrencyProvider>
                <div className="min-h-screen bg-white text-black p-0 print:p-0">
                    {children}
                </div>
            </CurrencyProvider>
        </QueryProvider>
    );
}
