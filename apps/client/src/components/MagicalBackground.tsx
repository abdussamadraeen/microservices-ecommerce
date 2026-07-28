"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    isSparkle: boolean;
}

const MagicalBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            const particleCount = Math.floor(window.innerWidth / 15); // Responsive count
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.2, // Slow drift
                    speedY: (Math.random() - 0.5) * 0.2,
                    opacity: Math.random() * 0.5 + 0.1,
                    isSparkle: Math.random() > 0.9, // 10% sparkle chance
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use a "composite" operation for glow effects if desired, but keep simple for performance
            // ctx.globalCompositeOperation = 'lighter';

            particles.forEach((p) => {
                // Update
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around screen
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Sparkle effect (twinkle opacity)
                if (p.isSparkle) {
                    p.opacity += (Math.random() - 0.5) * 0.05;
                    if (p.opacity < 0.1) p.opacity = 0.1;
                    if (p.opacity > 0.8) p.opacity = 0.8;
                }

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

                // Celestial Colors (Gold/Blueish white)
                // We can make them slightly gold for "Legendary" feel
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
                gradient.addColorStop(1, `rgba(255, 215, 0, 0)`); // Gold fade

                ctx.fillStyle = gradient; // p.isSparkle ? `rgba(255, 255, 255, ${p.opacity})` : `rgba(230, 230, 255, ${p.opacity})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        resizeCanvas();
        createParticles();
        drawParticles();

        window.addEventListener("resize", () => {
            resizeCanvas();
            particles = [];
            createParticles();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-1]"
            style={{
                background: "linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)", // Very subtle light gradient base
            }}
        />
    );
};

export default MagicalBackground;
