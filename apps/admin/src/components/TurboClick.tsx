"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ClickEffect {
    id: number;
    x: number;
    y: number;
}

const TurboClick = () => {
    const [clicks, setClicks] = useState<ClickEffect[]>([]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const id = Date.now();
            setClicks((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);

            // Cleanup after animation
            setTimeout(() => {
                setClicks((prev) => prev.filter((c) => c.id !== id));
            }, 600);
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            <AnimatePresence>
                {clicks.map((click) => (
                    <motion.div
                        key={click.id}
                        initial={{ opacity: 0.8, scale: 0 }}
                        animate={{ opacity: 0, scale: 2.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute rounded-full bg-blue-500/30 blur-sm border border-blue-400/50"
                        style={{
                            left: click.x,
                            top: click.y,
                            width: 80,
                            height: 80,
                            x: "-50%",
                            y: "-50%",
                        }}
                    />
                ))}
                {/* Secondary inner ring for "Turbo" feel */}
                {clicks.map((click) => (
                    <motion.div
                        key={`inner-${click.id}`}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute rounded-full border-2 border-white/80"
                        style={{
                            left: click.x,
                            top: click.y,
                            width: 40,
                            height: 40,
                            x: "-50%",
                            y: "-50%",
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default TurboClick;
