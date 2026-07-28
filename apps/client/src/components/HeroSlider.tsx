"use client";

import { BannerType } from "@repo/types";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MiLoader } from "./MiLoader";
import { useSoundSystem } from "@/components/SoundController";
import { cn } from "@/lib/utils";

const HeroSlider = () => {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressRef = useRef<number>(0);
  const { playSwoosh, playClick } = useSoundSystem();

  // Parallax State (kept subtle for premium feel)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [[page, direction], setPage] = useState([0, 0]);

  // We keep 'current' derived or synced if possible, or just use page index
  // Let's wrap setCurrent to handle direction
  const paginate = (newDirection: number) => {
    playSwoosh();
    progressRef.current = 0;
    setPage([page + newDirection, newDirection]);
    setCurrent((prev) => {
      if (newDirection === 1) return prev === banners.length - 1 ? 0 : prev + 1;
      return prev === 0 ? banners.length - 1 : prev - 1;
    });
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/banners`
        );
        if (res.ok) {
          const data = await res.json();
          setBanners(data.filter((b: BannerType) => b.image && b.image.trim() !== ""));
        }
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-play Logic with Progress
  useEffect(() => {
    if (banners.length === 0 || !isPlaying) return;

    const duration = 6000;
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      progressRef.current += step;
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        paginate(1);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [banners, current, isPlaying]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 10;
    const y = (clientY / innerHeight - 0.5) * 10;
    setMousePosition({ x, y });
  };

  if (isLoading) return <MiLoader />;
  if (banners.length === 0) return null;

  const currentBanner: any = banners[current];
  if (!currentBanner) return null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div
      className="relative w-full aspect-[16/9] md:aspect-[2.5/1] mb-8 bg-transparent overflow-hidden group/slider perspective-1000 rounded-2xl shadow-2xl mt-4"
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", ease: "easeInOut", duration: 0.8 },
            opacity: { duration: 0.4 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e: any, { offset, velocity }: any) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Parallax Container */}
          <motion.div
            className="relative w-full h-full will-change-transform"
            animate={{
              x: -mousePosition.x,
              y: -mousePosition.y,
              rotateX: mousePosition.y * 1.5, // Increased tilt for visibility
              rotateY: mousePosition.x * 1.5, // Increased tilt for visibility
            }}
            transition={{ type: "spring", stiffness: 15, damping: 40, mass: 2 }}
          >
            {/* Static Image (No Zoom) */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0 }}
            >
              {/* Main sharp image - cover to fill but wider container ensures no side crop */}
              <div className="relative z-10 w-full h-full">
                {/* Text Overlay - Always Visible */}
                <div className="absolute inset-0 z-20 flex flex-col items-start justify-center px-12 sm:px-20 lg:px-32 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="max-w-4xl text-white space-y-2 pointer-events-auto"
                  >
                    {currentBanner.showTitle && (
                      <div style={{ color: currentBanner.textColor || 'white' }}>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-lg mb-2 leading-[1.1]">
                          {currentBanner.title}
                        </h2>
                        {currentBanner.description && (
                          <p className="text-lg md:text-xl font-normal tracking-wide opacity-90 drop-shadow-md leading-snug max-w-[480px]">
                            {currentBanner.description}
                          </p>
                        )}
                      </div>
                    )}


                  </motion.div>
                </div>

                {/* Link wraps the image if present */}
                {currentBanner.link ? (
                  <Link href={currentBanner.link} onClick={() => playClick()} className="w-full h-full block relative">
                    <Image
                      src={currentBanner?.image || ""}
                      alt={currentBanner?.title || "Xiaomi Banner"}
                      fill
                      className="object-cover object-center"
                      priority
                    />
                  </Link>
                ) : (
                  <Image
                    src={currentBanner?.image || ""}
                    alt={currentBanner?.title || "Xiaomi Banner"}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Controls Bar - Bottom Center - As per Image Reference */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 px-6 py-3 rounded-full bg-black/10 backdrop-blur-md border border-white/10 hover:bg-black/20 transition-all duration-300">

        {/* Progress Dashes */}
        <div className="flex gap-2">
          {banners.map((_, idx) => (
            <div
              key={idx}
              onClick={() => { playClick(); setCurrent(idx); progressRef.current = 0; }}
              className="group/dot relative h-1 cursor-pointer transition-all duration-300"
              style={{ width: 24 }} // Fixed width dashes as per image
            >
              {/* Background Track */}
              <div className={`absolute inset-0 rounded-full ${current === idx ? "bg-white/40" : "bg-white/20 group-hover/dot:bg-white/40"}`} />

              {/* Active Progress Fill */}
              {current === idx && (
                <motion.div
                  className="absolute inset-0 bg-[#FF6900] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: isPlaying ? "100%" : "0%" }} // Fill up if playing
                  transition={{ duration: 6, ease: "linear" }}
                  key={current}
                />
              )}
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/20" />

        {/* Circular Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => paginate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/10 text-white hover:bg-[#FF6900] hover:border-[#FF6900] transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/10 text-white hover:bg-[#FF6900] hover:border-[#FF6900] transition-all active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => paginate(1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/10 text-white hover:bg-[#FF6900] hover:border-[#FF6900] transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div >
  );
};

export default HeroSlider;
