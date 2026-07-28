"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Xiaomi SVG Path
const MI_PATH = "M12.984 8.654h2.576v11.756h-2.576v-11.756zm-7.653 7.828v-7.828h2.575v7.83c0 2.27 1.258 2.618 3.01 2.378v2.09c-4.223.518-5.586-1.123-5.586-4.468zm14.887-7.828h2.576v11.756h-2.576v-11.756zm-17.64 0h2.575v11.756h-2.575v-11.756zm7.653-5.266c.884 0 1.6.716 1.6 1.6 0 .885-.716 1.6-1.6 1.6-.885 0-1.6-.715-1.6-1.6 0-.884.715-1.6 1.6-1.6z";

const ACCENT_COLOR = "#FF6900"; // Xiaomi Orange

export default function ThreeDIntro({ onEnter }: { onEnter: () => void }) {
    const [logoUrl, setLogoUrl] = useState("/logo.png"); // Default

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.storeLogo) {
                        setLogoUrl(data.storeLogo);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    // Auto-enter sequence
    useEffect(() => {
        // ... existing timer logic
        const timer = setTimeout(() => {
            onEnter();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onEnter]);

    return (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden">
            <AnimatePresence>
                <motion.div
                    className="relative flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 100, opacity: 0 }} // Explode out
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Orange Square Background */}
                    <motion.div
                        className="w-24 h-24 md:w-32 md:h-32 bg-[#FF6900] rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(255,105,0,0.4)] overflow-hidden"
                        initial={{ borderRadius: "50%" }}
                        animate={{ borderRadius: "2rem" }}
                        transition={{ duration: 1, ease: "backOut", delay: 0.2 }}
                    >
                        {/* Dynamic Logo Image */}
                        <motion.img
                            src={logoUrl}
                            alt="Mi Logo"
                            className="w-14 h-14 md:w-20 md:h-20 object-contain"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            onError={(e) => {
                                // Fallback to SVG if image fails? Or just keep default
                                e.currentTarget.src = "/logo.png";
                            }}
                        />
                    </motion.div>

                    {/* Ripple Effect */}
                    <motion.div
                        className="absolute inset-0 border-2 border-[#FF6900] rounded-[2rem]"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
