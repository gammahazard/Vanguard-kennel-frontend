"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, PlusSquare, Menu, Smartphone, X } from "lucide-react";
import { useState } from "react";

interface InstallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InstallModal({ isOpen, onClose }: InstallModalProps) {
    const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#15161A] border border-white/10 w-full max-w-md rounded-3xl p-6 pointer-events-auto relative shadow-2xl">

                            {/* Close Button */}
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-12 h-12 bg-premium-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-premium-gold">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Install App</h2>
                                <p className="text-sm text-gray-400">Add Vanguard to your home screen for the full experience.</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1 bg-black/40 rounded-xl mb-6">
                                <button
                                    onClick={() => setActiveTab('ios')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'ios' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    iOS (iPhone)
                                </button>
                                <button
                                    onClick={() => setActiveTab('android')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'android' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Android
                                </button>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                                {activeTab === 'ios' ? (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                                                <Share className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm text-gray-300">1. Tap the <span className="text-white font-bold">Share</span> button in Safari.</p>
                                        </div>
                                        <div className="w-px h-4 bg-white/10 ml-4"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-gray-500/10 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                                                <PlusSquare className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm text-gray-300">2. Scroll down and tap <span className="text-white font-bold">Add to Home Screen</span>.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-gray-500/10 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                                                <Menu className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm text-gray-300">1. Tap the <span className="text-white font-bold">Menu</span> (three dots) in Chrome.</p>
                                        </div>
                                        <div className="w-px h-4 bg-white/10 ml-4"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 shrink-0">
                                                <Download className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm text-gray-300">2. Tap <span className="text-white font-bold">Install App</span> or <span className="text-white font-bold">Add to Home Screen</span>.</p>
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
