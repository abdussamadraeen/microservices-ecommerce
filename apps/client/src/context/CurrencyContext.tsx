"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Default fallback rates
const DEFAULT_RATES = {
    USD: 1,
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.79,
} as const;

type Currency = keyof typeof DEFAULT_RATES;

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    rates: Record<string, number>;
    formatPrice: (amount: number) => string;
    convertPrice: (amount: number) => number;
    isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: "INR",
    setCurrency: () => { },
    rates: DEFAULT_RATES,
    formatPrice: (amount) => `₹${amount}`,
    convertPrice: (amount) => amount,
    isLoading: false,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>("INR");
    const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved currency preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("clientCurrency");
        if (saved && (saved in DEFAULT_RATES)) {
            setCurrency(saved as Currency);
        }
    }, []);

    // Save currency preference
    useEffect(() => {
        localStorage.setItem("clientCurrency", currency);
    }, [currency]);

    // Fetch real-time rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
                if (res.ok) {
                    const data = await res.json();
                    setRates(data.rates);
                }
            } catch (err) {
                console.error("Error fetching rates:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, []);

    const convertPrice = (amountInUSD: number) => {
        // Assuming base price input (amount) is INR (as per current DB assumption)
        // Convert INR -> USD -> Target
        const inrRate = rates["INR"] || 83.5;
        const priceInUSD = amountInUSD / inrRate;
        const targetRate = rates[currency] || 1;
        return priceInUSD * targetRate;
    };

    const formatPrice = (amount: number) => {
        // Input amount is assumed to be INR
        const inrRate = rates["INR"] || 83.5;
        const targetRate = rates[currency] || 1;

        const converted = (amount / inrRate) * targetRate;

        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatPrice, convertPrice, isLoading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
