"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const CURRENCIES = [
    { code: "INR", label: "INR", flagCode: "in", symbol: "₹" },
    { code: "USD", label: "USD", flagCode: "us", symbol: "$" },
    { code: "EUR", label: "EUR", flagCode: "eu", symbol: "€" },
    { code: "GBP", label: "GBP", flagCode: "gb", symbol: "£" },
];

const CurrencySelector = () => {
    const { currency, setCurrency } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]!;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted/50 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
            >
                <div className="relative w-5 h-3.5 shadow-sm rounded-sm overflow-hidden">
                    <Image
                        src={`https://flagcdn.com/w40/${selected.flagCode}.png`}
                        alt={selected.code}
                        fill
                        className="object-cover"
                    />
                </div>
                <span>{selected.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-popover/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        {CURRENCIES.map((c) => (
                            <button
                                key={c.code}
                                onClick={() => {
                                    setCurrency(c.code as any);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground
                  ${currency === c.code ? "bg-accent/50 text-foreground font-medium" : "text-muted-foreground"}
                `}
                            >
                                <div className="relative w-5 h-3.5 shadow-sm rounded-sm overflow-hidden">
                                    <Image
                                        src={`https://flagcdn.com/w40/${c.flagCode}.png`}
                                        alt={c.code}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span>{c.code}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;
