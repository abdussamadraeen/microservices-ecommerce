"use client";

import { useEffect, useRef, useCallback } from "react";

type SoundType = "hover" | "click" | "swoosh";

const SOUND_FILES: Record<SoundType, string> = {
    hover: "/sounds/ui_hover.mp3",
    click: "/sounds/ui_click.mp3",
    swoosh: "/sounds/slider_swoosh.mp3",
};

interface UseSoundOptions {
    volume?: number;
    enabled?: boolean;
}

export const useSound = (
    { volume = 0.5, enabled = true }: UseSoundOptions = {}
) => {
    const audioMap = useRef<Record<SoundType, HTMLAudioElement | null>>({
        hover: null,
        click: null,
        swoosh: null,
    });

    useEffect(() => {
        // Preload sounds
        Object.entries(SOUND_FILES).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.volume = volume;
            audioMap.current[key as SoundType] = audio;
        });

        return () => {
            audioMap.current = { hover: null, click: null, swoosh: null };
        };
    }, [volume]);

    const playHover = useCallback(() => {
        if (!enabled || !audioMap.current.hover) return;
        const audio = audioMap.current.hover;
        audio.currentTime = 0; // Reset to start
        audio.play().catch(() => { }); // Ignore interaction errors
    }, [enabled]);

    const playClick = useCallback(() => {
        if (!enabled || !audioMap.current.click) return;
        const audio = audioMap.current.click;
        audio.currentTime = 0;
        audio.play().catch(() => { });
    }, [enabled]);

    const playSwoosh = useCallback(() => {
        if (!enabled || !audioMap.current.swoosh) return;
        const audio = audioMap.current.swoosh;
        audio.currentTime = 0;
        audio.play().catch(() => { });
    }, [enabled]);

    return { playHover, playClick, playSwoosh };
};
