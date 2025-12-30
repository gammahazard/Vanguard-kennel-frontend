"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumButton } from "./PremiumButton";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for background
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'h-20 bg-[#0B0C10]/95 backdrop-blur-md shadow-xl' : 'h-24 bg-[#0B0C10] border-b border-white/10'}`}>
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-4 z-50 relative">
                        <div className="w-10 h-10 rounded-xl bg-premium-gold flex items-center justify-center text-black shadow-lg shadow-premium-gold/20">
                            <span className="font-bold text-xl">V</span>
                        </div>
                        <span className="text-xl font-bold tracking-wide uppercase text-white hidden md:block">Vanguard</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6 mr-8 border-r border-white/10 pr-8">
                            <Link href="/client/login" className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
                                Client Login
                            </Link>
                            <Link href="/staff/login" className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
                                Staff Portal
                            </Link>
                        </div>
                        <Link href="/client/signup">
                            <PremiumButton variant="primary" className="py-3 px-6 text-xs">
                                Book Now
                            </PremiumButton>
                        </Link>
                    </div>

                    {/* Mobile Burger */}
                    <button
                        className="md:hidden z-50 relative text-white p-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-[#0B0C10] flex flex-col items-center justify-center space-y-8 md:hidden"
                    >
                        <Link href="/client/login" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white uppercase tracking-widest">
                            Client Login
                        </Link>
                        <Link href="/staff/login" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white uppercase tracking-widest">
                            Staff Portal
                        </Link>
                        <Link href="/demo" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-gray-500 uppercase tracking-widest">
                            View Demo Page
                        </Link>
                        <Link href="/client/signup" onClick={() => setIsOpen(false)}>
                            <PremiumButton variant="primary" className="mt-8 text-lg px-12 py-4">
                                Book Boarding
                            </PremiumButton>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
