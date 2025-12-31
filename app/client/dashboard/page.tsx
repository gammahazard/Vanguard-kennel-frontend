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
    Collapse,
    Badge,
    Dialog,
    DialogContent,
    DialogActions,
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
    Info,
    ArrowForward,
    Chat,
    Fingerprint,
    Close
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
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showUpsell, setShowUpsell] = useState(false);

    useEffect(() => {
        const storedName = typeof window !== 'undefined' ? localStorage.getItem('vanguard_user') : null;
        if (storedName) setUserName(storedName);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const email = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email') : null;
        if (!email) return;

        // FACE ID UPSELL LOGIC
        const faceidEnabled = (typeof window !== 'undefined' ? localStorage.getItem('vanguard_faceid_enabled') : null) === 'true';
        const upsellSeen = (typeof window !== 'undefined' ? localStorage.getItem('vanguard_upsell_seen') : null) === 'true';

        if (!faceidEnabled && !upsellSeen) {
            // Delay slightly for better UX
            setTimeout(() => setShowUpsell(true), 1500);
        }

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

            // Fetch notifications for unread count
            const notifRes = await fetch(`${API_BASE_URL}/api/notifications?email=${encodeURIComponent(email)}`);
            if (notifRes.ok) {
                const notifs = await notifRes.json();
                setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
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
        if (newValue === 3) router.push('/client/messenger');
        if (newValue === 4) router.push('/client/profile');
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
                    <IconButton
                        size="small"
                        sx={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        onClick={() => router.push('/client/notifications')}
                    >
                        <Badge badgeContent={unreadCount} color="error" overlap="circular" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                            <Notifications sx={{ fontSize: 20 }} />
                        </Badge>
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
                                Today&apos;s Highlights
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

                        {/* 4. COMPACT BILLING SNAPSHOT */}
                        <Paper
                            onClick={() => router.push('/client/wallet')}
                            sx={{
                                p: 2.5,
                                borderRadius: 4,
                                cursor: 'pointer',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                border: '1px solid rgba(212, 175, 55, 0.15)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                                transition: 'all 0.2s'
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack spacing={0.5}>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <Wallet sx={{ color: 'primary.main', fontSize: 18 }} />
                                        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.1em' }} color="text.secondary">
                                            Balance Due
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>${balance.toFixed(2)}</Typography>
                                </Stack>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    sx={{ borderRadius: 2, borderColor: 'rgba(212, 175, 55, 0.3)' }}
                                >
                                    Details
                                </Button>
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
                        <BottomNavigationAction label="Chat" icon={<Chat />} />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper >

            </Box >

            {/* --- FACE ID UPSELL MODAL --- */}
            <Dialog
                open={showUpsell}
                onClose={() => {
                    setShowUpsell(false);
                    localStorage.setItem('vanguard_upsell_seen', 'true');
                }}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 5,
                        backgroundImage: 'none',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{ position: 'relative', p: 3, textAlign: 'center' }}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setShowUpsell(false);
                            localStorage.setItem('vanguard_upsell_seen', 'true');
                        }}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
                    >
                        <Close fontSize="small" />
                    </IconButton>

                    <Box sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '50%',
                        mx: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        mt: 2
                    }}>
                        <Fingerprint sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Faster, Safer Access
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Would you like to enable Face ID or Touch ID for your next login? It&apos;s more secure and faster than passwords.
                    </Typography>

                    <Stack spacing={1.5}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                setShowUpsell(false);
                                localStorage.setItem('vanguard_upsell_seen', 'true');
                                router.push('/client/profile');
                            }}
                            sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold' }}
                        >
                            Enable Now
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => {
                                setShowUpsell(false);
                                localStorage.setItem('vanguard_upsell_seen', 'true');
                            }}
                            sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
                        >
                            No thanks, maybe later
                        </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.5 }}>
                        Tip: You can always find this in your Profile settings.
                    </Typography>
                </Box>
            </Dialog>

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

function CamCard({ name }: { name: string }) {
    return (
        <Paper sx={{
            minWidth: 280,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            aspectRatio: '16/9',
            bgcolor: '#000',
            flexShrink: 0
        }}>
            <Box sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(212, 175, 55, 0.9)',
                px: 1.2,
                py: 0.4,
                borderRadius: 1,
                backdropFilter: 'blur(4px)'
            }}>
                <Typography variant="caption" fontWeight="bold" color="black" sx={{ fontSize: '0.65rem' }}>COMING SOON</Typography>
            </Box>

            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                <Videocam sx={{ fontSize: 48 }} />
            </Box>

            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
            }}>
                <Typography variant="caption" sx={{ fontWeight: 500, opacity: 0.8 }}>{name}</Typography>
            </Box>
        </Paper>
    );
}
