"use client";

import { motion } from "framer-motion";
import { ArrowRight, LucideIcon } from "lucide-react";
import React from "react";

interface PremiumButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    link?: string;
    icon?: LucideIcon;
    variant?: "primary" | "secondary" | "outline";
    className?: string;
}

export const PremiumButton = ({ children, onClick, icon: Icon, variant = "primary", className = "" }: PremiumButtonProps) => {

    const baseStyles = "relative font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 uppercase tracking-widest text-sm";

    const variants = {
        primary: "bg-gradient-to-r from-premium-gold to-[#FAD980] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] border border-transparent",
        secondary: "bg-white text-black hover:bg-gray-100 shadow-xl",
        outline: "bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/60"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
            {Icon && <Icon className="w-5 h-5" />}
        </motion.button>
    );
};
