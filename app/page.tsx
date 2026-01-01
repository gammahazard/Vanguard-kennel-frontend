"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Box,
    Typography,
    Button,
    Stack,
    Modal,
    Fade,
    Paper,
    CssBaseline,
    useMediaQuery
} from "@mui/material";
import { Download, Smartphone, Share, AddBox, Login, ArrowDownward, ArrowUpward, Security } from "@mui/icons-material";
import { motion } from "framer-motion";
import { createTheme, ThemeProvider } from '@mui/material/styles';

// --- Custom Dark/Gold Theme ---
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#D4AF37', // Gold
        },
        background: {
            default: '#050608',
            paper: '#0B0C10',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                },
            },
        },
    },
});

export default function SplashGate() {
    const [showInstall, setShowInstall] = useState(false);
    const [isPWA, setIsPWA] = useState(false);
    const [browserType, setBrowserType] = useState<'chrome-ios' | 'safari-ios' | 'firefox' | 'desktop-chrome' | 'other'>('other');

    useEffect(() => {
        // Check PWA Support
        const checkPWA = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
            setIsPWA(isStandalone);
        };

        // Enhanced Browser Detection
        const checkBrowser = () => {
            const ua = window.navigator.userAgent.toLowerCase();
            const isMobile = /iphone|ipad|ipod|android/i.test(ua);

            if (!isMobile) {
                if (ua.includes('firefox')) setBrowserType('firefox');
                else setBrowserType('desktop-chrome'); // Default to desktop chrome instructions for most
                return;
            }

            if (/crios/i.test(ua)) {
                setBrowserType('chrome-ios');
            } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
                setBrowserType('safari-ios');
            } else {
                setBrowserType('other');
            }
        };

        checkPWA();
        checkBrowser();
        window.addEventListener('resize', checkPWA);
        return () => window.removeEventListener('resize', checkPWA);
    }, []);

    // ... (Modal Logic)
    const handleOpen = () => setShowInstall(true);
    const handleClose = () => setShowInstall(false);

    return (
        <ThemeProvider theme={theme}>
            {/* ... (Layout remains same) ... */}
            <CssBaseline />
            {/* ... (Background & Header code same) ... */}

            {/* ... (Inside Modal Content) ... */}
            <Modal
                open={showInstall}
                onClose={handleClose}
                closeAfterTransition
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
            >
                <Fade in={showInstall}>
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }} onClick={handleClose}>
                        <Paper
                            elevation={24}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                                bgcolor: '#15161A',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 4,
                                p: 4,
                                width: '90%',
                                maxWidth: 400,
                                textAlign: 'center',
                                outline: 'none',
                                position: 'relative',
                                zIndex: 2
                            }}
                        >
                            <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                                <Smartphone sx={{ color: '#D4AF37', fontSize: 30 }} />
                            </Box>

                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                Install Application
                            </Typography>

                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                                {browserType.includes('desktop') ? "Install on your PC/Mac for best performance." : "For security reasons, this app runs best from your home screen."}
                            </Typography>

                            <Stack spacing={2} sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 3, borderRadius: 3, textAlign: 'left', mb: 3 }}>
                                {browserType === 'desktop-chrome' && (
                                    <>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 1:</b> Look for the <b>Install</b> icon (⊕ or Computer) in the right side of the URL bar.</Typography></Stack>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 2:</b> Click <b>Install</b> to add to your desktop.</Typography></Stack>
                                    </>
                                )}
                                {browserType === 'firefox' && (
                                    <>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 1:</b> Look for the <b>Install</b> icon in the right side of the address bar.</Typography></Stack>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 2:</b> If missing, this might not be supported on Firefox Desktop yet.</Typography></Stack>
                                    </>
                                )}
                                {browserType === 'safari-ios' && (
                                    <>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 1:</b> Tap the <b>Share Button</b> (Rectangle with Arrow) at the bottom center.</Typography></Stack>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 2:</b> Scroll down and tap <b>Add to Home Screen</b>.</Typography></Stack>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 3:</b> Tap <b>Add</b> in the top right.</Typography></Stack>
                                    </>
                                )}
                                {browserType === 'chrome-ios' && (
                                    <>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 1:</b> Tap the <b>Share Button</b> in the address bar (Top Right).</Typography></Stack>
                                        <Stack direction="row" spacing={2}><Typography variant="body2" color="#ccc"><b>Step 2:</b> Scroll down and tap <b>Add to Home Screen</b>.</Typography></Stack>
                                    </>
                                )}
                                {browserType === 'other' && (
                                    <Typography variant="body2" color="#ccc">Use your browser's menu to find "Add to Home Screen" or "Install App".</Typography>
                                )}
                            </Stack>
                        </Paper>

                        {/* Dynamic Arrows */}

                        {/* Desktop: Point to Top Right URL Bar */}
                        {(browserType === 'desktop-chrome' || browserType === 'firefox') && (
                            <Box
                                component={motion.div}
                                sx={{ position: 'absolute', top: 20, right: 40, color: '#EF4444', zIndex: 10, pointerEvents: 'none' }}
                                animate={{ x: [0, 10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowUpward sx={{ fontSize: 48, transform: 'rotate(45deg)', filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' }} />
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', textShadow: '0 2px 4px black' }}>CLICK HERE</Typography>
                            </Box>
                        )}

                        {/* Safari iOS: Point to Bottom Center */}
                        {browserType === 'safari-ios' && (
                            <Box
                                component={motion.div}
                                sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: '#EF4444', zIndex: 100, pointerEvents: 'none', textAlign: 'center' }}
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', textShadow: '0 2px 4px black', mb: 0.5 }}>TAP SHARE</Typography>
                                <ArrowDownward sx={{ fontSize: 48, filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' }} />
                            </Box>
                        )}

                        {/* Chrome iOS: Point to Top Right */}
                        {browserType === 'chrome-ios' && (
                            <Box
                                component={motion.div}
                                sx={{ position: 'fixed', top: 20, right: 20, color: '#EF4444', zIndex: 100, pointerEvents: 'none', textAlign: 'center' }}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowUpward sx={{ fontSize: 48, filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' }} />
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', textShadow: '0 2px 4px black', mt: 0.5 }}>TAP HERE</Typography>
                            </Box>
                        )}

                    </Box>
                </Fade>
            </Modal>

            {/* --- GLOBAL BRANDING FOOTER --- */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: { xs: 20, md: 40 },
                    left: 0,
                    width: '100%',
                    textAlign: 'center',
                    zIndex: 5,
                    pointerEvents: 'none'
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: '#D4AF37',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        opacity: 0.6,
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                    }}
                >
                    <Security sx={{ fontSize: 14 }} /> Powered by Vanguard Secure Solutions
                </Typography>
                <Box sx={{ width: 40, height: 1, bgcolor: 'rgba(212, 175, 55, 0.3)', mx: 'auto', mt: 1, borderRadius: 1 }} />
            </Box>

        </Box>
        </ThemeProvider >
    );
}
