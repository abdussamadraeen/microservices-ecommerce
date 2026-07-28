"use client";

interface ColorSwatchProps {
  color: string;
  size?: "sm" | "md";
}

// Separate component for dynamic color swatches
// Inline style is required here for dynamic colors from database
const ColorSwatch = ({ color, size = "sm" }: ColorSwatchProps) => {
  const sizeClass = size === "sm" ? "w-[14px] h-[14px]" : "w-5 h-5";
  
  return (
    <span
      className={`${sizeClass} rounded-full block`}
      style={{ backgroundColor: color }}
      role="img"
      aria-label={`Color: ${color}`}
    />
  );
};

export default ColorSwatch;
