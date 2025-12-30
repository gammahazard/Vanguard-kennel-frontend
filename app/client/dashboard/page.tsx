"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Container,
    Stack,
    Paper,
    Avatar,
    IconButton,
    Button,
    Chip,
    BottomNavigation,
    BottomNavigationAction,
    ThemeProvider,
    CssBaseline,
    Grid,
    Collapse
} from "@mui/material";
import {
    Home,
    Pets,
    CalendarMonth,
    Person,
    Notifications,
    Videocam,
    Restaurant,
    SportsBaseball,
    Bedtime,
    Wallet,
    CreditCard,
    CurrencyBitcoin,
    ExpandMore
} from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState("Guest");
    const [navValue, setNavValue] = useState(0);
    const [showCrypto, setShowCrypto] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem('vanguard_user');
        if (storedName) setUserName(storedName);
    }, []);

    const handleNavChange = (event: any, newValue: number) => {
        setNavValue(newValue);
        if (newValue === 1) router.push('/client/pets');
        if (newValue === 2) router.push('/client/bookings');
        if (newValue === 3) router.push('/client/profile');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 9 }}>

                {/* --- TOP BAR --- */}
                <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.main', fontWeight: 'bold' }}>
                            {userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="primary" sx={{ letterSpacing: '0.1em', fontWeight: 'bold' }}>CLIENT PORTAL</Typography>
                            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>Hello, {userName}</Typography>
                        </Box>
                    </Stack>
                    <IconButton size="small" sx={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Notifications sx={{ fontSize: 20 }} />
                    </IconButton>
                </Paper>

                {/* --- MAIN CONTENT --- */}
                < Container maxWidth="sm" sx={{ pt: 3, position: 'relative', zIndex: 1 }}>
                    <Stack spacing={3}>

                        {/* 1. STATUS BADGE */}
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, p: 1, pl: 2, width: 'fit-content' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Winston is Active</Typography>
                        </Stack>

                        {/* 2. LIVE FEED CARD */}
                        <Paper sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 4,
                            border: '1px solid rgba(255,255,255,0.1)',
                            aspectRatio: '16/9',
                            bgcolor: '#000'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                zIndex: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: 'rgba(239, 68, 68, 0.8)',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                backdropFilter: 'blur(4px)'
                            }}>
                                <Videocam sx={{ fontSize: 16, color: '#fff' }} />
                                <Typography variant="caption" fontWeight="bold" color="white" sx={{ letterSpacing: '0.05em' }}>LIVE</Typography>
                            </Box>

                            {/* Placeholder Video Content */}
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                <Pets sx={{ fontSize: 64 }} />
                            </Box>

                            <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>Camera 04 - Executive Wing</Typography>
                            </Box>
                        </Paper>

                        {/* 3. DAILY HIGHLIGHTS (Horizontal Scroll) */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em', pl: 1 }}>
                                Today's Highlights
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, mx: -2, px: 2, mt: 1, '::-webkit-scrollbar': { display: 'none' } }}>

                                <HighlightCard
                                    icon={<Restaurant sx={{ color: '#4ade80' }} />}
                                    time="08:30 AM"
                                    title="Breakfast"
                                    desc="Ate 100%"
                                />
                                <HighlightCard
                                    icon={<SportsBaseball sx={{ color: '#60a5fa' }} />}
                                    time="11:15 AM"
                                    title="Playtime"
                                    desc="Group Play"
                                />
                                <HighlightCard
                                    icon={<Bedtime sx={{ color: '#a78bfa' }} />}
                                    time="02:00 PM"
                                    title="Nap"
                                    desc="Resting"
                                />

                            </Stack>
                        </Box>

                        {/* 4. BILLING CARD */}
                        <Paper sx={{
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Wallet sx={{ color: 'primary.main', fontSize: 20 }} />
                                    <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.1em' }} color="text.secondary">
                                        Outstanding Balance
                                    </Typography>
                                </Stack>

                                <Typography variant="h3" sx={{ fontWeight: 300 }}>$0.00</Typography>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<CreditCard />}
                                    sx={{ mt: 1 }}
                                >
                                    Pay Now
                                </Button>

                                <Box sx={{ pt: 1 }}>
                                    <Button
                                        size="small"
                                        endIcon={<ExpandMore sx={{ transform: showCrypto ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
                                        onClick={() => setShowCrypto(!showCrypto)}
                                        sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.75rem' }}
                                    >
                                        Advanced Options
                                    </Button>

                                    <Collapse in={showCrypto}>
                                        <Paper sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2 }}>
                                            <Stack spacing={1}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <CurrencyBitcoin sx={{ fontSize: 16, color: '#60a5fa' }} />
                                                    <Typography variant="caption" color="text.secondary">USDC / ETH Accepted</Typography>
                                                </Stack>
                                                <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'rgba(0,0,0,0.5)', p: 1, borderRadius: 1, display: 'block', wordBreak: 'break-all' }}>
                                                    0x71C7656EC7ab8...f6d8976F
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.65rem' }}>
                                                    *Instant settlement via Smart Contract.
                                                </Typography>
                                            </Stack>
                                        </Paper>
                                    </Collapse>
                                </Box>
                            </Stack>
                        </Paper>

                    </Stack>
                </Container >

                {/* --- BOTTOM NAVIGATION --- */}
                < Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.05)' }} elevation={3} >
                    <BottomNavigation
                        showLabels
                        value={navValue}
                        onChange={handleNavChange}
                        sx={{
                            bgcolor: '#0B0C10',
                            height: 70,
                            '& .Mui-selected': { color: '#D4AF37 !important' },
                            '& .MuiBottomNavigationAction-label': { fontSize: '0.7rem', mt: 0.5 }
                        }}
                    >
                        <BottomNavigationAction label="Home" icon={<Home />} />
                        <BottomNavigationAction label="Pets" icon={<Pets />} />
                        <BottomNavigationAction label="Bookings" icon={<CalendarMonth />} />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper >

            </Box >
        </ThemeProvider >
    );
}

function HighlightCard({ icon, time, title, desc }: { icon: any, time: string, title: string, desc: string }) {
    return (
        <Paper sx={{
            minWidth: 140,
            p: 2,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <Stack spacing={1}>
                {icon}
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">{time}</Typography>
                    <Typography variant="body2" fontWeight="bold">{title}</Typography>
                    <Typography variant="caption" color="text.secondary">{desc}</Typography>
                </Box>
            </Stack>
        </Paper>
    );
}
