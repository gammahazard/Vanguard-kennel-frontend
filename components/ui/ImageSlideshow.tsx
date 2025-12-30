"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, PawPrint } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        title: "The Royal Suite",
        description: "Climate controlled luxury for your best friend.",
        color: "from-blue-900 to-slate-900"
    },
    {
        id: 2,
        title: "Agility Park",
        description: "2 acres of supervised play area.",
        color: "from-green-900 to-slate-900"
    },
    {
        id: 3,
        title: "Gourmet Kitchen",
        description: "Freshly prepared meals daily.",
        color: "from-orange-900 to-slate-900"
    }
];

export function ImageSlideshow() {
    const [index, setIndex] = useState(0);

    const nextSlide = () => {
        setIndex((prev) => (prev + 1) % SLIDES.length);
    };

    const prevSlide = () => {
        setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">

            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-br ${SLIDES[index].color} flex flex-col items-center justify-center text-center p-8`}
                >
                    {/* Picture Frame / Drop Zone Indicator */}
                    <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-premium-gold rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-premium-gold rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-premium-gold rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-premium-gold rounded-br-xl"></div>
                    </div>

                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm relative z-10">
                        <PawPrint className="w-10 h-10 text-white/50" />
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg relative z-10">
                        {SLIDES[index].title}
                    </h3>
                    <p className="text-lg text-gray-200 font-light max-w-md relative z-10">
                        {SLIDES[index].description}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {SLIDES.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-premium-gold' : 'w-2 bg-white/30'}`}
                    />
                ))}
            </div>

        </div>
    );
}
