"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Sparkles, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { ProductType } from "@repo/types";

// --- Ultra-Premium 3D Experience (Xiaomi Flagship Style) ---

function Crystal({ position, rotation, scale, color, speed }: { position: [number, number, number], rotation: [number, number, number], scale: number, color: string, speed: number }) {
    const mesh = useRef<THREE.Mesh>(null);

    // Random rotation axis
    const rotSpeed = useRef<number[]>([
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed
    ]);

    useFrame((state, delta) => {
        const r = rotSpeed.current;
        if (mesh.current && r) {
            mesh.current.rotation.x += r[0]! * delta;
            mesh.current.rotation.y += r[1]! * delta;
            mesh.current.rotation.z += r[2]! * delta;

            // Subtle floating (bobbing)
            mesh.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.005;
        }
    });

    return (
        <Float rotationIntensity={2} floatIntensity={2} floatingRange={[-0.2, 0.2]}>
            <mesh ref={mesh} position={position} rotation={rotation} scale={scale}>
                <octahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial
                    backside
                    thickness={0.5}
                    roughness={0.0}
                    transmission={1}
                    ior={1.5}
                    chromaticAberration={1.0}
                    anisotropy={0.5}
                    color={color}
                    resolution={1024}
                />
            </mesh>
        </Float>
    );
}

function CameraRig() {
    useFrame((state, delta) => {
        const easing = 0.25;
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 2, easing * delta);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 1, easing * delta);
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}

function FloatingBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            {/* Gradient Background for Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-black dark:via-zinc-900 dark:to-black opacity-80" />

            <Canvas camera={{ position: [0, 0, 15], fov: 35 }} gl={{ antialias: true, alpha: true }}>
                {/* Cinematic Lighting */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#FF6900" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#3388ff" />

                {/* Floating "Xiaomi" Particles */}
                <Sparkles
                    count={150}
                    scale={12}
                    size={2}
                    speed={0.4}
                    opacity={0.5}
                    color="#FF6900"
                />

                <Sparkles
                    count={100}
                    scale={15}
                    size={1}
                    speed={0.2}
                    opacity={0.3}
                    color="#ffffff"
                />

                {/* Crystal Shards - The "Tech" */}
                <group>
                    {/* Hero Big Crystal (Orange) */}
                    <Crystal position={[4, 1, -2]} rotation={[0, 0, 0]} scale={2.5} color="#FF6900" speed={1.2} />

                    {/* Secondary Crystals (Glass/Blue-ish) */}
                    <Crystal position={[-5, 2, -5]} rotation={[1, 1, 0]} scale={1.8} color="#aabbff" speed={0.8} />
                    <Crystal position={[3, -4, -3]} rotation={[2, 0, 1]} scale={1.2} color="#ffffff" speed={1.0} />
                    <Crystal position={[-3, -3, 0]} rotation={[0, 2, 2]} scale={0.8} color="#FF6900" speed={0.5} />

                    {/* Tiny decorative shards */}
                    <Crystal position={[0, 5, -8]} rotation={[1, 0, 0]} scale={0.5} color="#FF6900" speed={2.0} />
                </group>

                <CameraRig />
                <Environment preset="city" blur={1} />
            </Canvas>
        </div>
    );
}

// --- 3D Tilt Card ---
const TiltCard = ({ children, className, href }: { children: React.ReactNode, className?: string, href: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <Link href={href} className={`block ${className || ""}`}>
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full h-full rounded-[30px] overflow-hidden bg-gray-50 dark:bg-zinc-900 border border-transparent dark:border-white/10 shadow-sm hover:shadow-2xl transition-shadow duration-300 group perspective-1000"
            >
                {/* Shine Effect */}
                <div
                    className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
                    style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.8) 45%, rgba(255,255,255,0.1) 50%, transparent 54%)"
                    }}
                />

                <div className="absolute inset-0" style={{ transform: "translateZ(0px)" }}>
                    {children}
                </div>
            </motion.div>
        </Link>
    );
};


export default function XiaomiGrid() {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Config
                let configData = null;
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/ecosystem`);
                    if (res.ok) configData = await res.json();
                } catch (e) {

                }
                setConfig(configData);

                // 2. Fetch Products
                let fetchedProducts: ProductType[] = [];

                const allProdRes = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?limit=100`);
                if (allProdRes.ok) {
                    const allProds = await allProdRes.json();

                    if (configData && configData.heroProductId) {
                        // Sort by config
                        const hero = allProds.find((p: any) => p.id === Number(configData.heroProductId));
                        const sides = configData.subProductIds?.map((id: any) => allProds.find((p: any) => p.id === Number(id))).filter(Boolean) || [];

                        if (hero) fetchedProducts.push(hero);
                        fetchedProducts.push(...sides);

                        // Fill if missing
                        if (fetchedProducts.length < 5) {
                            const remaining = allProds.filter((p: any) => !fetchedProducts.find(fp => fp.id === p.id)).slice(0, 5 - fetchedProducts.length);
                            fetchedProducts.push(...remaining);
                        }
                    } else {
                        // Default
                        fetchedProducts = allProds.slice(0, 6);
                    }
                }

                setProducts(fetchedProducts);
            } catch (e) {
                console.error("Failed to load ecosystem data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getImg = (p: ProductType) => {
        try {
            if (!p.images) return "https://placehold.co/600x400?text=No+Image";

            // 1. Handle Array (Seed data simple string[])
            if (Array.isArray(p.images)) {
                if (p.images.length > 0 && typeof p.images[0] === 'string') {
                    return p.images[0];
                }
            }

            // 2. Handle Record (Complex object map)
            if (typeof p.images === 'object') {
                const imgMap = p.images as Record<string, string | string[]>;
                const allVars = Object.values(imgMap).flat();
                // Find first valid http string
                const clean = allVars.find(i => typeof i === "string" && i.startsWith("http"));
                return (clean as string) || "https://placehold.co/600x400?text=No+Image";
            }

            return "https://placehold.co/600x400?text=No+Image";
        } catch { return "https://placehold.co/600x400?text=No+Image"; }
    };

    if (!loading && products.length === 0) return null;

    const heroProduct = products[0];
    const subProducts = products.length > 1 ? products.slice(1, 5) : [];

    // Dynamic Text or Default
    const title = config?.title || "The Xiaomi Ecosystem.";
    const subtitle = config?.subtitle || "Seamlessly connected. Beautifully designed.";

    const badgeStyles = [
        { label: "Best Seller", bg: "bg-gradient-to-r from-amber-500 to-orange-500", text: "text-white" },
        { label: "New Arrival", bg: "bg-gradient-to-r from-blue-500 to-cyan-500", text: "text-white" },
        { label: "Trending", bg: "bg-gradient-to-r from-purple-500 to-pink-500", text: "text-white" },
    ];

    return (
        <section className="relative w-full py-28 overflow-hidden bg-gradient-to-b from-white via-gray-50/80 to-white dark:from-black dark:via-zinc-950 dark:to-black">
            <FloatingBackground />

            <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl mb-5">
                            {config?.title ? config.title : (
                                <>The <span className="bg-gradient-to-r from-[#FF6900] to-[#FF8C40] bg-clip-text text-transparent">Xiaomi</span> Ecosystem.</>
                            )}
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light tracking-wide">
                            {subtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto md:h-[800px]">
                    {loading ? (
                        <>
                            {/* Skeleton Hero */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 md:row-span-2 h-[500px] md:h-full rounded-[30px] bg-gray-100 dark:bg-zinc-900 animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
                            </div>
                            {/* Skeleton Side Grid */}
                            <div className="flex flex-col gap-6 h-full col-span-1 md:col-span-2 lg:col-span-1">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex-1 min-h-[200px] rounded-[30px] bg-gray-100 dark:bg-zinc-900 animate-pulse" />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* ===== HERO CARD ===== */}
                            {heroProduct && (
                                <TiltCard href={`/products/${heroProduct.id}`} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 md:row-span-2 h-[500px] md:h-full">
                                    <div className="flex flex-col items-center justify-between h-full w-full p-8 md:p-12 text-center relative bg-gradient-to-b from-white/80 via-transparent to-gray-100/50 dark:from-zinc-900/80 dark:via-transparent dark:to-zinc-800/50">
                                        <div className="mt-8 z-20" style={{ transform: "translateZ(50px)" }}>
                                            <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest text-[#FF6900] uppercase border border-[#FF6900]/30 rounded-full bg-gradient-to-r from-[#FF6900]/10 to-[#FF8C40]/10 shadow-sm">
                                                ★ Flagship
                                            </span>
                                            <h3 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                                                {heroProduct.name}
                                            </h3>
                                            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto line-clamp-2 leading-relaxed">
                                                {heroProduct.description}
                                            </p>
                                            <div className="mt-8 flex items-center justify-center gap-6">
                                                <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer transition-colors hover:text-blue-700">Learn more →</span>
                                                <span className="px-6 py-2.5 bg-[#FF6900] text-white font-semibold rounded-full hover:bg-[#E55E00] transition-all duration-300 hover:shadow-lg hover:shadow-[#FF6900]/25 cursor-pointer">Buy now</span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 h-[60%] w-full">
                                            <Image
                                                src={getImg(heroProduct)}
                                                alt={heroProduct.name}
                                                fill
                                                className="object-contain object-bottom transition-transform duration-700 hover:scale-105 drop-shadow-2xl"
                                                sizes="(max-width: 768px) 100vw, 66vw"
                                            />
                                        </div>

                                        {/* Hero bottom gradient overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent dark:from-zinc-900 pointer-events-none z-10" />
                                    </div>
                                </TiltCard>
                            )}

                            {/* ===== SIDE GRID - 3 Premium Cards ===== */}
                            <div className="grid grid-cols-1 grid-rows-3 gap-5 h-full col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2">
                                {subProducts.slice(0, 3).map((prod, idx) => {
                                    const badge = badgeStyles[idx] || badgeStyles[0];
                                    return (
                                        <TiltCard key={prod.id} href={`/products/${prod.id}`} className="h-full w-full">
                                            <div className="relative h-full w-full p-5 md:p-6 flex flex-row items-center gap-4 overflow-hidden group">
                                                {/* Animated gradient border on hover */}
                                                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-[#FF6900]/0 via-transparent to-blue-500/0 group-hover:from-[#FF6900]/10 group-hover:to-blue-500/5 transition-all duration-700 pointer-events-none" />

                                                {/* Text Section - Left */}
                                                <div style={{ transform: "translateZ(30px)" }} className="z-10 relative flex-1 min-w-0">
                                                    {/* Badge */}
                                                    <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-full mb-2 ${badge!.bg} ${badge!.text} shadow-sm`}>
                                                        {badge!.label}
                                                    </span>

                                                    <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-snug group-hover:text-[#FF6900] transition-colors duration-300 line-clamp-2">
                                                        {prod.name}
                                                    </h4>

                                                    <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1 font-medium">
                                                        {prod.shortDescription || "Premium Xiaomi product"}
                                                    </p>

                                                    {/* Price indicator */}
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                            ₹{prod.price?.toLocaleString("en-IN") || "—"}
                                                        </span>
                                                        <span className="text-[10px] text-[#FF6900] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            View →
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Image Section - Right */}
                                                <div className="relative w-[45%] h-[85%] flex-shrink-0" style={{ transform: "translateZ(20px)" }}>
                                                    <div className="relative w-full h-full transform transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1">
                                                        <Image
                                                            src={getImg(prod)}
                                                            alt={prod.name}
                                                            fill
                                                            className="object-contain object-center drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-500"
                                                            sizes="(max-width: 768px) 50vw, 25vw"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Decorative elements */}
                                                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-tl from-[#FF6900]/8 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-[#FF6900]/15 transition-all duration-700" />
                                                <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>
                                        </TiltCard>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
