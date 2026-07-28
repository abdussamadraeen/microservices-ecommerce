"use client";

import { motion } from "framer-motion";

export const MiLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50/90 backdrop-blur-sm">
            <div className="relative">
                {/* Blue Glow for Admin Touch */}
                <motion.div
                    className="absolute inset-0 rounded-[24px] bg-blue-500/30 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.div
                    className="relative flex items-center justify-center bg-[#FF6900] rounded-[20px] w-24 h-24 shadow-2xl overflow-hidden border border-orange-400/50"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {/* Inner Shine */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                    />

                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="z-10"
                    >
                        <path
                            d="M29.1 16.4V31.6H25.5V18.2H20.1V31.6H16.5V16.4H29.1ZM33.6 16.4H37.2V31.6H33.6V16.4Z"
                            fill="white"
                        />
                    </svg>
                </motion.div>

                {/* Admin Label with Blue Accent */}
                <motion.div
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        Admin Console
                    </span>
                </motion.div>
            </div>
        </div>
    );
};
