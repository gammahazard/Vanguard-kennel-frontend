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
    Apple,
    Celebration,
    Info
} from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

export default function ClientDashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState("Guest");
    const [navValue, setNavValue] = useState(0);
    const [balance, setBalance] = useState(0);
    const [nextStay, setNextStay] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem('vanguard_user');
        if (storedName) setUserName(storedName);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const email = localStorage.getItem('vanguard_email');
        if (!email) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/user/bookings?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const bookings = await res.json();

                // Calculate Balance: Sum of Confirmed bookings
                const total = bookings
                    .filter((b: any) => b.status === "Confirmed")
                    .reduce((sum: number, b: any) => sum + b.total_price, 0);
                setBalance(total);

                // Find next stay: nearest future date
                const upcoming = bookings
                    .filter((b: any) => b.status !== "Completed" && b.status !== "Cancelled")
                    .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

                if (upcoming.length > 0) setNextStay(upcoming[0]);
            }
        } catch (err) {
            console.error("Home fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

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
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Guest is Active</Typography>
                        </Stack>

                        {/* 2. LIVE KENNEL CAMS (Horizontal Scroll) */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em', pl: 1 }}>
                                Live Kennel Transparency
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{
                                overflowX: 'auto', pb: 1, mx: -2, px: 2, mt: 1,
                                '::-webkit-scrollbar': { display: 'none' }
                            }}>
                                <CamCard name="Camera 01 - Executive Wing" />
                                <CamCard name="Camera 02 - Main Play Area" />
                                <CamCard name="Camera 03 - Outdoor Run" />
                                <CamCard name="Camera 04 - Grooming Suite" />
                            </Stack>
                        </Box>

                        {/* 3. NEXT STAY QUICK VIEW */}
                        {nextStay && (
                            <Paper sx={{
                                p: 2.5,
                                borderRadius: 4,
                                bgcolor: 'rgba(212, 175, 55, 0.05)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1.5, bgcolor: '#D4AF37', borderRadius: 3, display: 'flex' }}>
                                        <Celebration sx={{ color: 'black' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="primary" fontWeight="bold">UPCOMING ADVENTURE</Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {nextStay.service_type} stay starts in {Math.ceil((new Date(nextStay.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days!
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        )}

                        {/* 4. DAILY HIGHLIGHTS (Horizontal Scroll) */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em', pl: 1 }}>
                                Today's Highlights
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, mx: -2, px: 2, mt: 1, '::-webkit-scrollbar': { display: 'none' } }}>
                                {/* Dynamic logic could go here, for now keeping mock */}
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
                                    time="Grooming"
                                    title="Ready!"
                                    desc="Next Appointment"
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

                                <Typography variant="h3" sx={{ fontWeight: 300 }}>${balance.toFixed(2)}</Typography>

                                <Stack spacing={1} sx={{ mt: 1 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<CreditCard />}
                                        sx={{ bgcolor: '#635BFF' }} // Stripe Blurple
                                    >
                                        Pay with Card
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<Wallet />}
                                        sx={{ borderColor: '#0070BA', color: '#0070BA' }} // PayPal Blue
                                    >
                                        PayPal
                                    </Button>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<Apple />}
                                        sx={{ bgcolor: 'black', color: 'white', '&:hover': { bgcolor: '#333' } }}
                                    >
                                        Apple Pay
                                    </Button>
                                </Stack>

                                <Box sx={{ pt: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Prefer to use cryptocurrency?
                                    </Typography>
                                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 2 }}>
                                        <CurrencyBitcoin sx={{ fontSize: 16, color: '#F7931A' }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                            We accept USDC, USDT, BTC, ETH
                                        </Typography>
                                    </Stack>
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
