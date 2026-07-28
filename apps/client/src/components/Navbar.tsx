"use client";

import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { Bell, Home } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useTheme } from "next-themes";
import ProfileButton from "./ProfileButton";
import { useState, useEffect, Suspense } from "react";
import { ThemeToggle } from "./ThemeToggle";
import CurrencySelector from "./CurrencySelector";
import NavMegaMenu from "./NavMegaMenu";

const navLinks = [
  { label: "Store", href: "/" },
  { label: "Phones", href: "/products?category=phones" },
  { label: "Tablets", href: "/products?category=tablets" },
  { label: "TV & Smart Home", href: "/products?category=smart-home" },
  { label: "Watches", href: "/products?category=watches" },
  { label: "Audio", href: "/products?category=audio" },
];

const Navbar = () => {
  const { theme } = useTheme();
  // const { currency, setCurrency } = useCurrency(); // Moved to CurrencySelector
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLinkHover = (href: string) => {
    const slug = href.split("category=")[1];
    if (slug) {
      setHoveredLink(slug);
      setIsMenuVisible(true);
    } else {
      setIsMenuVisible(false);
    }
  };

  // Determine overlay color based on theme
  const isGoldMode = mounted && theme === 'gold';
  const overlayClass = isGoldMode
    ? "bg-primary/10" // Dynamic Champagne Gold tint
    : "bg-white/20"; // Standard white tint for Light/Dark

  return (
    <>
      {/* Backdrop Blur Overlay - Moved outside nav to escape containing block */}
      {isMenuVisible && (
        <div
          className={`fixed inset-0 top-[60px] z-[40] ${overlayClass} transition-all duration-300 animate-in fade-in`}
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          aria-hidden="true"
        />
      )}

      <nav
        className="sticky top-0 z-50 bg-background/75 backdrop-blur-3xl backdrop-saturate-200 shadow-md transition-all duration-300"
        onMouseLeave={() => setIsMenuVisible(false)}
      >
        <div className="flex items-center justify-between px-4 md:px-8 py-3 relative bg-transparent">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-sm bg-white">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group py-4 hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  onMouseEnter={() => handleLinkHover(link.href)}
                >
                  {link.label}
                  <span className="absolute bottom-2 left-0 w-full h-[2px] bg-primary dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* SearchBar */}
            <div className="hidden sm:block w-full max-w-sm flex-1 mx-4">
              <Suspense fallback={<div className="w-full h-12 bg-muted/40 rounded-full animate-pulse" />}>
                <SearchBar />
              </Suspense>
            </div>





            {/* Icons */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground mr-2">
                <a href="https://www.mi.com/in/discover/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:drop-shadow-sm">Discover</a>
                <a href="https://www.mi.com/in/support/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:drop-shadow-sm">Support</a>
              </div>

              {/* Currency Selector */}
              <CurrencySelector />

              <Link href="/" className="p-2 hover:bg-primary/10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95" aria-label="Notifications">
                <Bell className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <div className="hover:scale-110 transition-transform duration-300">
                <ThemeToggle />
              </div>
              <div className="hover:scale-110 transition-transform duration-300">
                <ShoppingCartIcon />
              </div>
            </div>

            {/* Auth */}
            <SignedOut>
              <SignInButton>
                <button className="text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <ProfileButton />
            </SignedIn>
          </div>
        </div>

        {/* Mega Menu */}
        <NavMegaMenu
          activeCategorySlug={hoveredLink}
          isVisible={isMenuVisible}
          onMouseEnter={() => setIsMenuVisible(true)}
          onMouseLeave={() => setIsMenuVisible(false)}
        />
      </nav>
    </>
  );
};

export default Navbar;
