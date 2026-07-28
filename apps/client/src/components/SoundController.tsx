"use client";

import { useSound } from "@/hooks/useSound";
import { Volume2, VolumeX } from "lucide-react";
import { useState, createContext, useContext, useEffect } from "react";

const SoundContext = createContext<{
    isEnabled: boolean;
    toggleSound: () => void;
    playHover: () => void;
    playClick: () => void;
    playSwoosh: () => void;
}>({
    isEnabled: false,
    toggleSound: () => { },
    playHover: () => { },
    playClick: () => { },
    playSwoosh: () => { },
});

export const useSoundSystem = () => useContext(SoundContext);

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false); // Default off to respect auto-play policies




    const { playHover, playClick, playSwoosh } = useSound({ enabled: isEnabled });

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleSound = () => setIsEnabled(!isEnabled);

    return (
        <SoundContext.Provider value={{ isEnabled, toggleSound, playHover, playClick, playSwoosh }}>
            {children}

            {/* Sound Toggle UI - Rendered only on client to prevent hydration mismatch */}
            {mounted && (
                <div className="fixed bottom-28 right-6 z-[100] print:hidden">
                    <button
                        onClick={() => {
                            playClick();
                            toggleSound();
                        }}
                        className={`p-3 rounded-full shadow-lg backdrop-blur-md border transition-all duration-300 hover:scale-110 active:scale-95 ${isEnabled
                            ? "bg-amber-500/80 text-white border-amber-300 shadow-amber-500/20"
                            : "bg-gray-900/50 text-gray-400 border-white/10 hover:bg-gray-800/80 hover:text-white"
                            }`}
                        title={isEnabled ? "Mute Sounds" : "Enable Sounds"}
                    >
                        {isEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                </div>
            )}
        </SoundContext.Provider>
    );
};
