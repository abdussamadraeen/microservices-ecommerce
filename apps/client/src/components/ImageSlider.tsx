"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
    images: string | string[];
}

const ImageSlider = ({ images }: ImageSliderProps) => {
    const [index, setIndex] = useState(0);

    const imageList = (Array.isArray(images) ? images : [images]).filter(img => img && img.trim() !== "");

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (imageList.length < 2 || isHovered) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
        }, 3000);
        return () => clearInterval(interval);
    }, [imageList.length, isHovered]);

    if (imageList.length === 0) {
        return (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No Image Available
            </div>
        )
    }

    const next = () => {
        setIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
    };

    const prev = () => {
        setIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
    };

    return (
        <div
            className="relative w-full aspect-[3/4] group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* SLIDING CONTAINER */}
            <div
                className="flex h-full w-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {imageList.map((img, i) => (
                    <div key={i} className="relative w-full h-full flex-shrink-0">
                        <Image
                            src={img}
                            alt={`Product image ${i + 1}`}
                            fill
                            className="object-contain p-8"
                            priority={i === 0}
                        />
                    </div>
                ))}
            </div>

            {imageList.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); prev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-gray-100 z-10"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); next(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-gray-100 z-10"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {imageList.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? 'bg-black w-6' : 'bg-gray-400 hover:bg-gray-600'}`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageSlider;
