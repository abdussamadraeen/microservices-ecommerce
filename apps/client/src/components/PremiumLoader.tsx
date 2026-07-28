"use client";

import { cn } from "@/lib/utils";

interface PremiumLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const PremiumLoader = ({ className, size = "md" }: PremiumLoaderProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-[spin_3s_linear_infinite]" />
      
      {/* Middle Rotating Arc */}
      <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-[spin_1.5s_ease-in-out_infinite]" />
      
      {/* Inner Pulsing Core */}
      <div className="absolute inset-[25%] rounded-full bg-primary/20 backdrop-blur-sm animate-pulse" />
      
      {/* Center Dot */}
      <div className="absolute inset-[40%] rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
    </div>
  );
};
