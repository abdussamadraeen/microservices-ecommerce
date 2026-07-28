"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ThreeDIntro = dynamic(() => import("./ThreeDIntro"), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center text-black">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#FF6900] rounded-full animate-spin" />
        </div>
    )
});

export default function HomePageIntroWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showIntro, setShowIntro] = useState(true);

    // Optional: Auto-dismiss after some time? User said "Store button will be sending us to our current homepage"
    // So we rely on the button inside ThreeDIntro to set showIntro(false).

    return (
        <>
            <AnimatePresence>
                {showIntro && (
                    <ThreeDIntro onEnter={() => setShowIntro(false)} />
                )}
            </AnimatePresence>

            {/* 
          We render the children always so they are ready/SEO friendly, 
          but maybe we hide them visually or just let the Intro cover them (z-index).
          The Intro has z-[100] and bg-black so it covers everything.
      */}
            <div className={showIntro ? "h-screen overflow-hidden" : ""}>
                {children}
            </div>
        </>
    );
}
