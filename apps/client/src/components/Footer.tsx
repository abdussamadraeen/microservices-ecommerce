"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  X,
  ChevronRight,
  Phone
} from "lucide-react";

const columns = [
  {
    title: "Support",
    links: [
      { name: "Online Help", url: "https://www.mi.com/in/service/help/" },
      { name: "Customer Service", url: "https://www.mi.com/in/service/online/" },
      { name: "Shipping FAQ", url: "https://www.mi.com/in/service/shipping/" },
      { name: "Warranty", url: "https://www.mi.com/in/service/warranty/" },
      { name: "Xiaomi Exchange", url: "https://in.event.mi.com/in/xiaomi-exchange" },
      { name: "User Guide", url: "https://www.mi.com/in/service/userguide/" },
      { name: "Laptop Drivers", url: "https://www.mi.com/in/service/support/laptop-drivers.html" },
      { name: "Mi Screen Protect", url: "https://in.event.mi.com/in/mi-screen-protect" },
      { name: "Mi Extended Warranty", url: "https://www.mi.com/in/service/miextendedwarranty/" },
      { name: "Mi Complete Protect", url: "https://in.event.mi.com/in/mi-complete-protect" },
      { name: "Certification", url: "https://www.mi.com/in/certification/" },
      { name: "Service Centre", url: "https://www.mi.com/in/service/service-center/" },
      { name: "Xiaomi Easy Finance", url: "https://in.event.mi.com/in/xiaomi-easy-finance" },
      { name: "Xiaomi Spotify India", url: "https://www.mi.com/in/event/xiaomi-spotify-india/" }
    ]
  },
  {
    title: "Shop and Learn",
    links: [
      { name: "Xiaomi Phones", url: "https://mi.com/in/product-list/xiaomi/" },
      { name: "Redmi Phones", url: "https://mi.com/in/product-list/redmi/" },
      { name: "Tv's", url: "https://mi.com/in/product-list/tv/" },
      { name: "Laptops and Tablets", url: "https://mi.com/in/product-list/laptops/" },
      { name: "Audio", url: "https://mi.com/in/product-list/audio/" },
      { name: "Lifestyle", url: "https://mi.com/in/product-list/grooming-hygiene/" },
      { name: "Smart Home", url: "https://mi.com/in/product-list/smart-cleaner/" }
    ]
  },
  {
    title: "Retail Store",
    links: [
      { name: "Mi Home", url: "https://www.mi.com/in/service/mihome/" },
      { name: "Mi Authorized Store", url: "https://www.mi.com/in/service/authorized_stores/" },
      { name: "Mi Store Franchise", url: "https://in.event.mi.com/in/questionnaire/mistore_franchise" }
    ]
  },
  {
    title: "About Us",
    links: [
      { name: "Xiaomi", url: "https://www.mi.com/in/about/founder/" },
      { name: "Privacy Policy", url: "https://www.mi.com/in/about/privacy/" },
      { name: "User Agreement", url: "https://www.mi.com/in/about/agreement/" },
      { name: "Integrity & Compliance", url: "https://integrity.mi.com/global/" },
      { name: "CSR and Disclosures", url: "https://in.event.mi.com/in/csr-india" },
      { name: "E-Waste Management", url: "https://www.mi.com/in/support/terms/e-wastemanagement/" },
      { name: "In The Press", url: "https://in.event.mi.com/in/statement-from-xiaomi-india" },
      { name: "Trust Center", url: "https://trust.mi.com/" },
      { name: "Culture", url: "https://www.mi.com/in/about/#culture" },
      { name: "Smartphone Quality", url: "https://www.mi.com/in/smartphone-quality/" },
      { name: "TV Quality", url: "https://www.mi.com/in/tv-quality/" },
      { name: "Service Quality", url: "https://www.mi.com/in/service-quality/" },
      { name: "Xiaomi HyperOS", url: "https://www.mi.com/in/hyperos/" },
      { name: "Join Our Team", url: "https://www.mi.com/in/careers/" }
    ]
  }
];

const Footer = () => {
  return (
    <footer className="w-full bg-black/95 backdrop-blur-3xl border-t border-white/5 text-gray-300 shadow-[0_-20px_80px_rgba(0,0,0,0.8)]">
      {/* MOBILE / TABLET LAYOUT */}
      <div className="block md:hidden pt-6 pb-4 px-4">
        <div className="space-y-6">
          {/* Follow Mi - Mobile */}
          <div className="border-b border-gray-700 pb-5">
            <h3 className="font-bold text-white mb-4 text-sm">Follow Mi</h3>
            <div className="flex gap-5">
              <a href="#" className="text-white hover:text-gray-300" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-300" aria-label="X (Twitter)">
                <X className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-300" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Customer Service - Mobile */}
          <div className="border-b border-gray-700 pb-5">
            <h4 className="font-bold text-white mb-3 text-sm">Customer Service</h4>
            <div className="flex items-center gap-2 text-white text-sm">
              <Phone size={16} />
              <span>1800 103 6286</span>
            </div>
          </div>

          {/* Input - Mobile */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Let&apos;s stay in touch</h4>
            <div className="relative w-full">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full bg-black border border-gray-600 rounded-lg py-3 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300" aria-label="Subscribe">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* App Card - Mobile */}
          <div>
            <div className="bg-[#202020] rounded-xl p-4 w-full flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-white p-1 rounded-md flex-shrink-0">
                  <Image src="/appqr.png" alt="Mi app QR" width={55} height={55} className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-bold text-white">Get mi store app</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-1">
                    Scan for our up-to-date information for better shopping experience
                  </div>
                </div>
              </div>
              <a
                href="https://in.event.mi.com/in/install-mi-store"
                className="flex items-center justify-center gap-2 bg-black border border-gray-600 rounded-lg py-2 hover:bg-gray-900 transition-colors w-full"
              >
                <Image src="/Playstore-Icon.png" alt="Google Play" width={18} height={18} />
                <span className="text-white text-xs font-medium">Download on Google play</span>
              </a>
            </div>
          </div>

          {/* Bottom - Mobile */}
          <div className="flex justify-between items-center text-xs pt-4 border-t border-gray-700 mt-4">
            <Link href="#" className="hover:text-white">Sitemap</Link>
            <div className="flex gap-2 items-center">
              <span>India / English</span>
              <span>🌐</span>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block pt-12 pb-6">
        <div className="w-full bg-transparent relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-12 gap-x-8 mb-10 items-start">

              {/* LINKS SECTIONS */}
              {columns.slice(0, 3).map((col, idx) => (
                <div key={idx} className="col-span-2">
                  <h4 className="text-white font-bold mb-4 text-sm">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map(link => (
                      <li key={link.name}>
                        <Link href={link.url} className="text-gray-400 hover:text-white text-xs transition-colors">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {columns.slice(3, 4).map((col, idx) => (
                <div key={idx} className="col-span-3">
                  <h4 className="text-white font-bold mb-4 text-sm">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map(link => (
                      <li key={link.name}>
                        <Link href={link.url} className="text-gray-400 hover:text-white text-xs transition-colors">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* RIGHT SIDE: CONTACT & APP */}
              <div className="col-span-3 flex flex-col items-start w-full">

                {/* 1. Follow Mi (With Bottom Border) */}
                <div className="w-full border-b border-gray-700 pb-6 mb-6">
                  <h3 className="font-bold text-white mb-4 text-sm">Follow Mi</h3>
                  <div className="flex gap-5">
                    <a href="https://www.facebook.com/XiaomiIndia/" target="_blank" rel="noreferrer noopener" className="text-white hover:text-gray-300" aria-label="Facebook">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="https://twitter.com/XiaomiIndia/" target="_blank" rel="noreferrer noopener" className="text-white hover:text-gray-300" aria-label="X (Twitter)">
                      <X className="w-5 h-5" />
                    </a>
                    <a href="https://instagram.com/XiaomiIndia/" target="_blank" rel="noreferrer noopener" className="text-white hover:text-gray-300" aria-label="Instagram">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* 2. Customer Service (With Bottom Border) */}
                <div className="w-full border-b border-gray-700 pb-6 mb-6">
                  <h4 className="font-bold text-white mb-2 text-sm">Customer Service</h4>
                  <p className="text-white text-sm flex items-center gap-2">
                    <Phone size={16} />
                    1800 103 6286
                  </p>
                </div>

                {/* 3. Let's stay in touch */}
                <div className="w-full mb-6">
                  <h4 className="font-bold text-white mb-3 text-sm">Let&apos;s stay in touch</h4>
                  <div className="relative w-full">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full bg-black border border-gray-600 rounded-lg py-3 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300" aria-label="Subscribe">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* 4. Get Mi Store App (Dark Card Container) */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-4 w-full flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-1 rounded-md flex-shrink-0">
                      {/* QR Code */}
                      <Image src="/appqr.png" alt="Mi app QR" width={55} height={55} className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm font-bold text-white">Get mi store app</div>
                      <div className="text-[11px] text-gray-400 leading-tight mt-1">
                        Scan for our up-to-date information for better shopping experience
                      </div>
                    </div>
                  </div>

                  {/* Download Button inside Card */}
                  <a
                    href="https://in.event.mi.com/in/install-mi-store"
                    className="flex items-center justify-center gap-2 bg-black border border-gray-600 rounded-lg py-2 hover:bg-gray-900 transition-colors w-full"
                  >
                    <Image src="/Playstore-Icon.png" alt="Google Play" width={18} height={18} />
                    <span className="text-white text-xs font-medium">Download on Google play</span>
                  </a>
                </div>

              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-700 text-xs text-gray-500">
              <div className="flex gap-6">
                <span>Copyright © 2010 - 2025 Xiaomi. All Rights Reserved | Developed by ABDUS SAMAD RAEEN</span>
                <Link href="https://www.mi.com/in/sitemap/" className="hover:text-white">Sitemap</Link>
              </div>

              <div className="flex gap-2 items-center cursor-pointer hover:text-white">
                <span>India / English</span>
                <span>🌐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
