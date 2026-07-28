"use client";

import { Printer } from "lucide-react";
import { useEffect } from "react";

const AutoPrint = () => {
    useEffect(() => {
        // Small delay to ensure styles loaded
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex justify-end mb-4 print:hidden">
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
            >
                <Printer className="w-4 h-4" />
                Print Invoice
            </button>
        </div>
    );
};

export default AutoPrint;
