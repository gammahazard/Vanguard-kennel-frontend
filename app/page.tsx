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
import { Download, Smartphone, Share, AddBox, Login, ArrowDownward } from "@mui/icons-material";
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

    useEffect(() => {
        const checkPWA = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
            setIsPWA(isStandalone);
        };
        checkPWA();
        window.addEventListener('resize', checkPWA);
        return () => window.removeEventListener('resize', checkPWA);
    }, []);

    // --- Modal Logic ---
    const handleOpen = () => setShowInstall(true);
    const handleClose = () => setShowInstall(false);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100dvh',
                    width: '100%',
                    bgcolor: 'background.default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Background Glow */}
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(212, 175, 55, 0.05)',
                    filter: 'blur(100px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <Stack spacing={8} alignItems="center" zIndex={1} sx={{ width: '100%', maxWidth: 400 }}>

                    {/* Header */}
                    <Stack spacing={1} alignItems="center" textAlign="center">
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: '0.2em',
                                color: '#fff',
                                textTransform: 'uppercase',
                                fontSize: { xs: '2rem', md: '3rem' }
                            }}
                        >
                            Vanguard
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: '#D4AF37',
                                letterSpacing: '0.4em',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                opacity: 0.8,
                                fontSize: '0.7rem'
                            }}
                        >
                            Premium Kennel Services
                        </Typography>
                    </Stack>

                    {/* Content Switch */}
                    {!isPWA ? (
                        /* --- BROWSER MODE: INSTALL PROMPT --- */
                        <Stack spacing={4} width="100%" alignItems="center">
                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontWeight: 300, maxWidth: '280px' }}>
                                For the premium experience, please install the application to your device.
                            </Typography>

                            <Button
                                onClick={handleOpen}
                                variant="contained"
                                startIcon={<Download />}
                                fullWidth
                                sx={{
                                    py: 2,
                                    background: 'linear-gradient(45deg, #D4AF37 30%, #AA8C2C 90%)',
                                    color: '#000',
                                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #E5C158 30%, #B89D3D 90%)',
                                        boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
                                    }
                                }}
                            >
                                Install App
                            </Button>
                        </Stack>
                    ) : (
                        /* --- PWA MODE: UNIFIED ACCESS --- */
                        <Stack spacing={3} width="100%">
                            <Typography variant="overline" sx={{ color: 'text.secondary', textAlign: 'center', letterSpacing: '0.2em' }}>
                                Secure Gateway
                            </Typography>

                            <Link href="/client/login" passHref style={{ width: '100%', textDecoration: 'none' }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<Login />}
                                    sx={{
                                        py: 2,
                                        background: 'linear-gradient(45deg, #D4AF37 30%, #AA8C2C 90%)',
                                        color: '#000',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Access Portal
                                </Button>
                            </Link>

                        </Stack>
                    )}

                </Stack>

                {/* --- MUI Modal --- */}
                <Modal
                    open={showInstall}
                    onClose={handleClose}
                    closeAfterTransition
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <Fade in={showInstall}>
                        <Paper
                            elevation={24}
                            sx={{
                                bgcolor: '#15161A',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 4,
                                p: 4,
                                width: '90%',
                                maxWidth: 400,
                                textAlign: 'center',
                                outline: 'none'
                            }}
                        >
                            <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                                <Smartphone sx={{ color: '#D4AF37', fontSize: 30 }} />
                            </Box>

                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                Install Application
                            </Typography>

                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                                For security reasons, this app runs best from your home screen.
                            </Typography>

                            <Stack spacing={2} sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 3, borderRadius: 3, textAlign: 'left', mb: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Share sx={{ color: '#3B82F6', fontSize: 24 }} />
                                    <Typography variant="body2" color="#ccc">
                                        1. Tap the <b>Share</b> button in the browser menu below.
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <AddBox sx={{ color: '#fff', fontSize: 24 }} />
                                    <Typography variant="body2" color="#ccc">
                                        2. Scroll down and select <b>Add to Home Screen</b>.
                                    </Typography>
                                </Stack>
                            </Stack>

                            {/* Animated Arrow for iOS Safari */}
                            <Box
                                component={motion.div}
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    color: '#D4AF37',
                                    mt: 2
                                }}
                            >
                                <Typography variant="caption" sx={{ mb: 0.5, letterSpacing: 1, opacity: 0.8 }}>TAP BELOW</Typography>
                                <ArrowDownward sx={{ fontSize: 32, filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.5))' }} />
                            </Box>

                        </Paper>
                    </Fade>
                </Modal>

            </Box>
        </ThemeProvider>
    );
}
