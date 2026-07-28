"use client"

import * as React from "react"
import { Monitor, Sun, Gem } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [isOpen, setIsOpen] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        // Cleanup global styles just in case
        document.body.style.background = ""
        document.body.style.minHeight = ""

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9 p-0 bg-transparent border-0 ring-0 focus:outline-none"
                aria-label="Toggle theme"
            >
                <div className="relative w-5 h-5 flex items-center justify-center">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all data-[theme=gold]:scale-0" />

                    {mounted && theme === 'gold' && (
                        <div className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all flex items-center justify-center">
                            <Gem className="h-[1.2rem] w-[1.2rem]" />
                        </div>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                        <button
                            onClick={() => { setTheme("light"); setIsOpen(false); }}
                            className="flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light</span>
                        </button>
                        <button
                            onClick={() => { setTheme("gold"); setIsOpen(false); }}
                            className="flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <div className="mr-2 h-4 w-4 rounded-full bg-[#d4af37] border border-[#b8952b]"></div>
                            <span>Gold</span>
                        </button>
                        <button
                            onClick={() => { setTheme("system"); setIsOpen(false); }}
                            className="flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>System</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
