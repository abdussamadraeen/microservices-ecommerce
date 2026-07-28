"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Default fallback rates in case API fails
const DEFAULT_RATES = {
    USD: 1,
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.79,
} as const;

type Currency = keyof typeof DEFAULT_RATES;

interface CurrencyContextType {
    currency: Currency;
    rates: Record<string, number>;
    formatPrice: (amount: number) => string;
    convertPrice: (amount: number) => number;
    isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: "INR",
    rates: DEFAULT_RATES,
    formatPrice: (amount) => `₹${amount}`,
    convertPrice: (amount) => amount,
    isLoading: false,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>("INR");
    const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
    const [isLoading, setIsLoading] = useState(true);

    // Load currency setting
    const loadSettings = () => {
        try {
            const saved = localStorage.getItem("adminSettings");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.currency) {
                    setCurrency(parsed.currency);
                }
            }
        } catch (e) {
            console.error("Failed to parse settings", e);
        }
    };

    useEffect(() => {
        loadSettings();

        // Listen for settings changes
        const handleSettingsUpdate = () => loadSettings();
        window.addEventListener("settingsUpdated", handleSettingsUpdate);

        return () => window.removeEventListener("settingsUpdated", handleSettingsUpdate);
    }, []);

    // Fetch real-time rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                setIsLoading(true);
                // Using a free exchange rate API (Base USD)
                const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
                if (res.ok) {
                    const data = await res.json();
                    setRates(data.rates);
                } else {
                    console.warn("Failed to fetch rates, using defaults");
                }
            } catch (err) {
                console.error("Error fetching rates:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
        // Refresh every hour
        const interval = setInterval(fetchRates, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, []);

    const convertPrice = (amountInUSD: number) => {
        // Assuming base price in DB is USD (or handle base currency logic)
        // If DB stores in INR, we need to convert INR -> Target
        // For this implementation, let's assume DB amounts are in the "Base" currency.
        // However, usually ecommerce DBs store in a fixed base.
        // If we assume DB is INR (since default was INR), we need INR -> USD.

        // BUT the API returns USD based rates.
        // Let's assume DB prices are in INR (since previous code used INR symbol default).
        // So: INR -> USD -> Target

        // Rate for INR (from USD base)
        const inrRate = rates["INR"] || 83.5;
        const priceInUSD = amountInUSD / inrRate; // Convert INR to USD first

        const targetRate = rates[currency] || 1;
        return priceInUSD * targetRate;
    };

    // Actually, wait. UserOrders had `formatCurrency` with `en-IN`.
    // This implies the raw numbers were in INR.
    // So `convertPrice` should treat input `amount` as INR.

    const formatPrice = (amount: number) => {
        // 1. Convert
        // Assuming Input Amount is INR
        const inrRate = rates["INR"] || 83.5; // e.g. 1 USD = 83.5 INR
        const targetRate = rates[currency] || 1; // e.g. 1 USD = 0.92 EUR

        // INR -> USD -> Target
        // Amount (INR) / Rate(INR per USD) * Rate(Target per USD)
        const converted = (amount / inrRate) * targetRate;

        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, rates, formatPrice, convertPrice, isLoading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
