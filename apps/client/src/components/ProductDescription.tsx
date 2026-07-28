"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ProductDescriptionProps {
    description: string;
    className?: string;
}

// Strict list of emojis we trust to render correctly across platforms
const SAFE_EMOJIS = new Set(["⚡", "🚀", "🔥", "✨", "✅", "⭐"]);

function parseDescription(description: string) {
    let cleanText = description
        .replace(/[\uFFFD\uFFFC\u2022\u2023\u25E6\u2043]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/Key Features/g, "\n\nKey Features")
        .trim();

    const emojiRegex = /([\u{1F4CA}\u{1F3A8}\u{1F50C}\u{1F50A}\u26A1\u{1F680}\u{1F4F1}\u{1F4F7}\u{1F50B}\u{1F4BE}\u{1F6E0}\u2728\u2705\u2B50\u{1F525}])/gu;
    const parts = cleanText.split(emojiRegex);

    const sections: { icon?: string; text: string }[] = [];

    if (parts.length === 1) {
        const paragraphs = cleanText.split(/\n\n+/);
        paragraphs.forEach(p => sections.push({ text: p.trim() }));
    } else {
        const firstPart = parts[0] || "";
        if (firstPart.trim()) {
            const introParas = firstPart.split(/\n\n+/);
            introParas.forEach(p => sections.push({ text: p.trim() }));
        }

        for (let i = 1; i < parts.length; i += 2) {
            const rawIcon = parts[i] || "";
            const rawText = parts[i + 1] || "";

            if (rawText && rawText.trim()) {
                const displayIcon = SAFE_EMOJIS.has(rawIcon) ? rawIcon : "•";
                let displayText = rawText.trim();
                displayText = displayText.replace(/^[\uFFFD\uFFFC]+\s*/, "");
                sections.push({ icon: displayIcon, text: displayText });
            }
        }
    }

    return sections;
}

export const ProductDescription = ({ description = "", className }: ProductDescriptionProps) => {
    const [sections, setSections] = useState<{ icon?: string; text: string }[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setSections(parseDescription(description));
        setMounted(true);
    }, [description]);

    // During SSR and initial hydration, render a simple plain text version
    // to avoid emoji regex mismatch between server and client
    if (!mounted) {
        return (
            <div className={cn("space-y-6 py-6", className)} suppressHydrationWarning>
                <p className="leading-relaxed text-gray-600 text-lg font-light" suppressHydrationWarning>
                    {description.replace(/[\uFFFD\uFFFC\u2022\u2023\u25E6\u2043]/g, " ").replace(/\s+/g, " ").trim()}
                </p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6 py-6", className)}>
            {sections.map((section, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={cn(
                        "leading-relaxed text-gray-600",
                        !section.icon && idx === 0 ? "text-lg font-light text-gray-700" : "text-base"
                    )}
                >
                    {section.icon ? (
                        <div className="flex gap-4 items-start ml-2">
                            <span className={cn(
                                "flex-shrink-0 select-none mt-0.5",
                                section.icon === "•" ? "text-gray-400 text-lg" : "text-xl"
                            )}>
                                {section.icon}
                            </span>
                            <div className="pt-0">
                                <FormattedText text={section.text} />
                            </div>
                        </div>
                    ) : (
                        <p className={section.text.startsWith("Key Features") ? "font-bold text-gray-900 mt-4 text-lg" : ""}>
                            <FormattedText text={section.text} />
                        </p>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

// Component to handle bolding keys like "Display: ..." or "Key Features"
const FormattedText = ({ text }: { text: string }) => {
    const match = text.match(/^([^:]{1,40}):\s*(.*)$/);
    if (match) {
        return (
            <>
                <span className="font-semibold text-gray-900">{match[1]}: </span>
                <span>{match[2]}</span>
            </>
        );
    }

    const keywords = ["Key Features", "Display", "Performance", "Battery", "Camera", "Connectivity", "Design"];
    for (const kw of keywords) {
        if (text.startsWith(kw)) {
            return (
                <>
                    <span className="font-semibold text-gray-900">{kw}</span>
                    <span>{text.substring(kw.length)}</span>
                </>
            );
        }
    }

    return <>{text}</>;
};
