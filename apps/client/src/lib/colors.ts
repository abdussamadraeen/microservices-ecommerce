export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1]!, 16),
            g: parseInt(result[2]!, 16),
            b: parseInt(result[3]!, 16),
        }
        : null;
}

export function getContrastColor(hex: string): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return "#000000";

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? "#000000" : "#ffffff";
}

export function adjustColor(hex: string, amount: number): string {
    let usePound = false;
    if (hex[0] === "#") {
        hex = hex.slice(1);
        usePound = true;
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00ff) + amount;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000ff) + amount;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, "0");
}

export function generatePalette(primaryHex: string) {
    const isLight = getContrastColor(primaryHex) === "#000000";

    // "Modern" Palette Generation
    // Instead of tinting the background heavily, we use a neutral base (White or Slate-950)
    // and only apply the color to Primary components.

    // We can still return a slight tint for the 'muted' or 'secondary' look if desired, 
    // but the main background should be clean.

    const isPrimaryLight = getContrastColor(primaryHex) === "#000000";

    return {
        // Base colors - keep them neutral/premium
        background: isLight ? "#ffffff" : "#020617",
        foreground: isLight ? "#0f172a" : "#f8fafc",

        // The main event
        primary: primaryHex,
        primaryForeground: isPrimaryLight ? "#000000" : "#ffffff",

        // Secondary/Muted can have a very subtle tint of the primary, or just Slate
        // Let's use Slate for consistency and premium feel, maybe with 5% opacity tint if we were using RGBA
        // For now, hardcoded premium slate scales
        secondary: isLight ? "#f1f5f9" : "#1e293b",
        secondaryForeground: isLight ? "#0f172a" : "#f8fafc",

        muted: isLight ? "#f1f5f9" : "#1e293b",
        mutedForeground: isLight ? "#64748b" : "#94a3b8",

        border: isLight ? "#e2e8f0" : "#1e293b",
        input: isLight ? "#e2e8f0" : "#1e293b",
        ring: primaryHex, // The focus ring matches the brand
    };
}

export function getGradientContrastColor(colors: string[]): string {
    // Simple heuristic: check the middle color, or average luminance?
    // Let's check the first color (usually the left-most) or the majority.
    // Ideally, we just check the middle stop.
    if (colors.length === 0) return "#ffffff";
    const mid = colors[Math.floor(colors.length / 2)];
    if (!mid) return "#ffffff";
    return getContrastColor(mid);
}
