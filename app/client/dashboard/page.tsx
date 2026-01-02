"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    Collapse,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Snackbar,
    Alert,
    CircularProgress,
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
    Add,
    Security,
    Close as CloseIcon,
    Check as CheckIcon,
    PriorityHigh
} from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { Booking, DailyReport, Notification } from "@/types";

import { authenticatedFetch } from "@/lib/api";
import { formatDateTimeEST, formatTimeEST } from "@/lib/dateUtils";

export default function ClientDashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState("Guest");
    const [navValue, setNavValue] = useState(0);
    const [balance, setBalance] = useState(0);
    const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
    const [weather, setWeather] = useState({ temp: 72, condition: "Sunny", icon: "☀️" });
    const [nextStay, setNextStay] = useState<Booking | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [msgUnreadCount, setMsgUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showUpsell, setShowUpsell] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [currentEmail, setCurrentEmail] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [allReports, setAllReports] = useState<DailyReport[]>([]);
    const [unpaidBookings, setUnpaidBookings] = useState<Booking[]>([]);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paying, setPaying] = useState(false);
    const [paymentFeedback, setPaymentFeedback] = useState({ open: false, text: "", severity: "success" as "success" | "error" });
    const [confirmPayment, setConfirmPayment] = useState<{ open: boolean, booking: Booking | null, amount: number, tax: number } | null>(null);

    useEffect(() => {
        const storedName = typeof window !== 'undefined' ? localStorage.getItem('vanguard_user') : null;
        if (storedName) setUserName(storedName);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const email = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email') : null;
        if (!email) return;

        const faceidEnabled = localStorage.getItem('vanguard_faceid_enabled') === 'true';
        const hideUpsell = localStorage.getItem(`vanguard_hide_upsell_${email}`) === 'true';
        setCurrentEmail(email);

        if (!faceidEnabled && !hideUpsell) {
            setTimeout(() => setShowUpsell(true), 1500);
        }

        try {
            const res = await authenticatedFetch(`/api/user/bookings`);
            if (res.ok) {
                const bookings = await res.json();

                const unpaid = bookings.filter((b: Booking) => {
                    const s = (b.status || '').toLowerCase();
                    const isCancellation = ['cancelled', 'no-show', 'no show'].includes(s);

                    const isActiveDebt = (s === 'confirmed') && !b.is_paid;
                    const isCancellationDebt = isCancellation && b.total_price > 0 && !b.is_paid;

                    return isActiveDebt || isCancellationDebt;
                });
                setUnpaidBookings(unpaid);

                const total = unpaid.reduce((sum: number, b: Booking) => {
                    const isCancellation = ['cancelled', 'no-show', 'no show'].includes((b.status || '').toLowerCase());
                    const tax = isCancellation ? 0 : b.total_price * 0.13;
                    return sum + b.total_price + tax;
                }, 0);
                setBalance(total);

                const upcoming = bookings
                    .filter((b: Booking) => {
                        const s = b.status?.toLowerCase();
                        return s !== "completed" && s !== "cancelled" && s !== "declined";
                    })
                    .sort((a: Booking, b: Booking) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

                if (upcoming.length > 0) {
                    setNextStay(upcoming[0]);

                    // Fetch reports for ALL upcoming stays (multi-dog support)
                    const reportPromises = upcoming.map((b: Booking) => authenticatedFetch(`/api/reports/${b.id}`));
                    const reportResponses = await Promise.all(reportPromises);
                    const reportsData = await Promise.all(reportResponses.filter(r => r.ok).map(r => r.json()));
                    const flattened = reportsData.flat().sort((a: DailyReport, b: DailyReport) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    setAllReports(flattened);
                }
            }

            const profileRes = await authenticatedFetch(`/api/user/profile`);
            if (profileRes.ok) {
                const profile = await profileRes.json();
                setWalletBalance(profile.balance || 0);
            }

            const notifRes = await authenticatedFetch(`/api/notifications`);
            if (notifRes.ok) {
                const notifs = await notifRes.json();
                setUnreadCount(notifs.filter((n: Notification) => !n.is_read).length);
            }

            const msgRes = await authenticatedFetch(`/api/messages`);
            if (msgRes.ok) {
                const msgs = await msgRes.json();
                const unreadMsgs = msgs.filter((m: any) =>
                    m.receiver_email.toLowerCase() === email.toLowerCase() &&
                    m.is_read === 0
                ).length;
                setMsgUnreadCount(unreadMsgs);
            }
        } catch (err) {
            console.error("Home fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayBooking = (booking: Booking) => {
        const isCancellation = ['cancelled', 'no-show', 'no show'].includes((booking.status || '').toLowerCase());
        const tax = isCancellation ? 0 : booking.total_price * 0.13;

        setConfirmPayment({
            open: true,
            booking: booking,
            amount: booking.total_price + tax,
            tax: tax
        });
    };

    const executePayment = async () => {
        if (!confirmPayment?.booking) return;

        setPaying(true);
        try {
            const res = await authenticatedFetch(`/api/wallet/pay`, {
                method: 'POST',
                body: JSON.stringify({ booking_id: confirmPayment.booking.id })
            });

            if (res.ok) {
                const data = await res.json();
                setPaymentFeedback({ open: true, text: data.message || "Payment Successful!", severity: "success" });
                setConfirmPayment(null);
                fetchDashboardData();
            } else {
                const err = await res.json();
                setPaymentFeedback({ open: true, text: err.error || "Payment Failed", severity: "error" });
            }
        } catch (e) {
            setPaymentFeedback({ open: true, text: "Connection error", severity: "error" });
        } finally {
            setPaying(false);
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
                <Container maxWidth="sm" sx={{ pt: 3, position: 'relative', zIndex: 1 }}>
                    <Stack spacing={3}>

                        {/* --- WEATHER & STATUS --- */}
                        <Paper sx={{
                            p: 2.5,
                            borderRadius: 4,
                            bgcolor: 'background.paper',
                            border: '1px solid rgba(255,255,255,0.05)',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)'
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="h3" fontWeight="bold" sx={{ fontSize: '2.2rem' }}>{weather.temp}°F</Typography>
                                        <Typography variant="h5" sx={{ opacity: 0.5 }}>{weather.icon}</Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                                        LAKESHORE, ON • {weather.condition.toUpperCase()}
                                    </Typography>
                                </Box>
                                <Stack alignItems="flex-end">
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: 'rgba(74, 222, 128, 0.1)', borderRadius: 2, px: 1.5, py: 0.5 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#4ade80', fontSize: '0.65rem' }}>FACILITY ACTIVE</Typography>
                                    </Stack>
                                    {allReports.length > 1 && (
                                        <Chip
                                            label={`${new Set(allReports.map(r => r.booking_id)).size} VIPs ON SITE`}
                                            size="small"
                                            sx={{ mt: 1, height: 18, fontSize: '0.6rem', bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.main', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                                        />
                                    )}
                                    <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.5, fontSize: '0.6rem' }}>STAFF ON SITE</Typography>
                                </Stack>
                            </Stack>
                        </Paper>

                        {allReports.length > 0 ? (
                            <Box>
                                <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.1em', pl: 1, display: 'block', mb: 1 }}>
                                    Living Feed: Recent Moments 📸
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, mx: -2, px: 2, '::-webkit-scrollbar': { display: 'none' } }}>
                                    {allReports.map((report, idx) => (
                                        <Paper key={idx} sx={{
                                            minWidth: 280,
                                            maxWidth: 280,
                                            p: 0,
                                            borderRadius: 4,
                                            bgcolor: 'background.paper',
                                            border: '1px solid rgba(212, 175, 55, 0.3)',
                                            overflow: 'hidden'
                                        }}>
                                            {report.image_url && (
                                                <Box sx={{ position: 'relative', height: 160, bgcolor: 'black' }}>
                                                    <Box
                                                        component="img"
                                                        src={report.image_url.startsWith('http') ? report.image_url : `${API_BASE_URL}${report.image_url}`}
                                                        alt="Pet Update"
                                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                                                    <Chip
                                                        label={report.mood}
                                                        color="primary"
                                                        size="small"
                                                        sx={{ position: 'absolute', bottom: 12, left: 12, fontWeight: 'bold', height: 20, fontSize: '0.65rem' }}
                                                    />
                                                </Box>
                                            )}
                                            <Box sx={{ p: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    {formatDateTimeEST(report.created_at)}
                                                </Typography>
                                                <Chip label={report.activity} size="small" variant="outlined" sx={{ mb: 1, height: 20, fontSize: '0.65rem', borderColor: 'rgba(255,255,255,0.2)' }} />
                                                {report.notes && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                                                        &quot;{report.notes}&quot;
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        ) : (
                            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <Typography variant="body2" color="text.secondary">No updates yet. Check back once your VIP stay begins!</Typography>
                            </Paper>
                        )}

                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em', pl: 1 }}>
                                Live Kennel Transparency
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{
                                overflowX: 'auto', pb: 1, mx: -2, px: 2, mt: 1,
                                '::-webkit-scrollbar': { display: 'none' }
                            }}>
                                <CamCard name="Camera 01 - Executive Wing" onClick={() => setSelectedCamera("Camera 01 - Executive Wing")} />
                                <CamCard name="Camera 02 - Main Play Area" onClick={() => setSelectedCamera("Camera 02 - Main Play Area")} />
                                <CamCard name="Camera 03 - Outdoor Run" onClick={() => setSelectedCamera("Camera 03 - Outdoor Run")} />
                                <CamCard name="Camera 04 - Nap Suite" onClick={() => setSelectedCamera("Camera 04 - Nap Suite")} />
                            </Stack>
                        </Box>

                        {nextStay && nextStay.status === 'confirmed' && (
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

                                        {/* Status Indicators */}
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            {nextStay.is_paid ? (
                                                <Stack spacing={0.5}>
                                                    <Chip
                                                        icon={<CheckIcon sx={{ fontSize: 16 }} />}
                                                        label="PAID"
                                                        color="success"
                                                        size="small"
                                                        sx={{ fontWeight: 'bold', borderRadius: 1.5, height: 24, width: 'fit-content' }}
                                                    />
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CheckIcon sx={{ fontSize: 12, color: 'success.main' }} />
                                                        Booking confirmed & paid. Reserved for {new Date(nextStay.start_date).toLocaleDateString()} - {new Date(nextStay.end_date).toLocaleDateString()}.
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Chip
                                                    label="PAYMENT DUE"
                                                    color="error"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', borderRadius: 1.5, height: 24, animation: 'pulse 2s infinite' }}
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        )}

                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em', pl: 1 }}>
                                Current Care Status
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, mx: -2, px: 2, mt: 1, '::-webkit-scrollbar': { display: 'none' } }}>
                                <HighlightCard
                                    icon={<Restaurant sx={{ color: '#4ade80' }} />}
                                    time="MORNING"
                                    title="Breakfast"
                                    desc={allReports[0]?.ate_breakfast || "Scheduled"}
                                />
                                <HighlightCard
                                    icon={<SportsBaseball sx={{ color: '#60a5fa' }} />}
                                    time="ACTIVITY"
                                    title="Playtime"
                                    desc={allReports[0]?.playtime_status || "In Progress"}
                                />
                                <HighlightCard
                                    icon={<Restaurant sx={{ color: '#facc15' }} />}
                                    time="EVENING"
                                    title="Dinner"
                                    desc={allReports[0]?.ate_dinner || "Scheduled"}
                                />
                            </Stack>
                        </Box>

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
                                    variant={balance > 0 ? "contained" : "outlined"}
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPaymentDialog(true);
                                    }}
                                    endIcon={balance > 0 ? <CreditCard /> : <ArrowForward />}
                                    sx={{
                                        borderRadius: 2,
                                        borderColor: 'rgba(212, 175, 55, 0.3)',
                                        bgcolor: balance > 0 ? 'primary.main' : 'transparent',
                                        color: balance > 0 ? 'background.default' : 'inherit',
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            bgcolor: balance > 0 ? '#b5932b' : 'rgba(212, 175, 55, 0.1)'
                                        }
                                    }}
                                >
                                    {balance > 0 ? "Pay Now" : "Details"}
                                </Button>
                            </Stack>
                        </Paper>

                        {/* 5. AVAILABLE CAPITAL (Instant Liquidity) */}
                        <Paper
                            sx={{
                                p: 2.5,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0,0,0,0) 100%)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Box>
                                <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
                                    Available Capital
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                            </Box>
                            <IconButton
                                sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.main' }}
                                onClick={() => router.push('/client/wallet')}
                            >
                                <Add />
                            </IconButton>
                        </Paper>

                    </Stack>
                </Container>

                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.05)' }} elevation={3}>
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
                        <BottomNavigationAction label="Chat" icon={
                            <Badge badgeContent={msgUnreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                                <Chat />
                            </Badge>
                        } />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper>

            </Box>

            {/* Camera Modal */}
            <Dialog
                open={!!selectedCamera}
                onClose={() => setSelectedCamera(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { bgcolor: '#000', borderRadius: 2, overflow: 'hidden' }
                }}
            >
                <Box sx={{ position: 'relative', aspectRatio: '16/9', bgcolor: '#000' }}>
                    <video
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src="https://videos.pexels.com/video-files/5532785/5532785-sd_640_360_25fps.mp4" type="video/mp4" />
                    </video>
                    <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: 'rgba(0,0,0,0.6)', px: 1.5, py: 0.5, borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold' }}>{selectedCamera}</Typography>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444', ml: 1, animation: 'pulse 1.5s infinite' }} />
                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.65rem' }}>LIVE</Typography>
                        </Stack>
                    </Box>
                    <IconButton
                        onClick={() => setSelectedCamera(null)}
                        sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Dialog>

            <Dialog
                open={showUpsell}
                onClose={(event, reason) => {
                    if (reason && reason === "backdropClick") return;
                    setShowUpsell(false);
                    if (dontShowAgain && currentEmail) {
                        localStorage.setItem(`vanguard_hide_upsell_${currentEmail}`, 'true');
                    }
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
                            if (dontShowAgain && currentEmail) {
                                localStorage.setItem(`vanguard_hide_upsell_${currentEmail}`, 'true');
                            }
                        }}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{
                        width: 64, height: 64, bgcolor: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%',
                        mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, mt: 2
                    }}>
                        <Fingerprint sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>Faster, Safer Access</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Would you like to enable Face ID or Touch ID for your next login? It&apos;s more secure and faster than passwords.
                    </Typography>

                    <Stack spacing={1.5}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                setShowUpsell(false);
                                if (currentEmail) localStorage.setItem(`vanguard_hide_upsell_${currentEmail}`, 'true');
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
                                if (dontShowAgain && currentEmail) {
                                    localStorage.setItem(`vanguard_hide_upsell_${currentEmail}`, 'true');
                                }
                            }}
                            sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
                        >
                            No thanks, maybe later
                        </Button>
                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            style={{ marginRight: 8, accentColor: '#D4AF37' }}
                        />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Don&apos;t show this again</Typography>
                    </Stack>
                </Box>
            </Dialog>

            {/* --- PAYMENT DIALOG --- */}
            <Dialog
                open={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 5,
                        backgroundImage: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        minWidth: { xs: '90%', sm: 400 }
                    }
                }}
            >
                <DialogContent>
                    <Stack spacing={3} sx={{ py: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
                                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(212, 175, 55, 0.1)' }}>
                                    <Wallet sx={{ color: 'primary.main', fontSize: 32 }} />
                                </Box>
                            </Stack>
                            <Typography variant="h6" fontWeight="bold">Settle Outstanding Stays</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Use your ${walletBalance.toLocaleString()} available capital to clear your account.
                            </Typography>
                        </Box>

                        <Divider sx={{ opacity: 0.1 }} />

                        <Stack spacing={2}>
                            {unpaidBookings.length > 0 ? (
                                unpaidBookings.map((b) => {
                                    const nights = Math.ceil((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / (1000 * 60 * 60 * 24));

                                    const isCancellation = ['cancelled', 'no-show', 'no show'].includes((b.status || '').toLowerCase());
                                    const tax = isCancellation ? 0 : b.total_price * 0.13;
                                    const grandTotal = b.total_price + tax;

                                    return (
                                        <Paper
                                            key={b.id}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                borderColor: 'rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Box>
                                                {['cancelled', 'no-show', 'no show'].includes((b.status || '').toLowerCase()) ? (
                                                    <>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PriorityHigh sx={{ fontSize: 16 }} />
                                                            {(b.status || '').toLowerCase().includes('no') ? 'No-Show Fee' : 'Cancellation Fee'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, lineHeight: 1.4 }}>
                                                            {(b.status || '').toLowerCase().includes('no')
                                                                ? `Missed appointment fee for ${b.service_type} on ${new Date(b.start_date).toLocaleDateString()}.`
                                                                : `Fee for cancelled ${b.service_type} stay reserved for ${new Date(b.start_date).toLocaleDateString()}.`
                                                            }
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'primary.main' }}>
                                                                {b.dog_name || "Pet"} • <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8em', fontWeight: 'normal' }}>
                                                                    {formatDateTimeEST(b.start_date).split(',')[0]} - {formatDateTimeEST(b.end_date).split(',')[0]} ({nights} nights)
                                                                </span>
                                                            </Typography>
                                                            <Chip label={b.service_type} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.1)' }} />
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                            {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()} • <strong>{nights} Nights</strong>
                                                        </Typography>
                                                        <Stack direction="row" spacing={2} sx={{ mt: 1, opacity: 0.8 }}>
                                                            <Typography variant="caption">Subtotal: ${b.total_price.toFixed(2)}</Typography>
                                                            <Typography variant="caption">HST (13%): ${tax.toFixed(2)}</Typography>
                                                        </Stack>
                                                    </>
                                                )}
                                                <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                                                    Total Due: ${grandTotal.toFixed(2)}
                                                </Typography>
                                            </Box>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={paying || walletBalance < grandTotal}
                                                onClick={() => handlePayBooking(b)}
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'background.default',
                                                    fontWeight: 'bold',
                                                    borderRadius: 1.5,
                                                    minWidth: 100,
                                                    '&:hover': { bgcolor: '#b5932b' }
                                                }}
                                            >
                                                {paying ? <CircularProgress size={16} color="inherit" /> : `Pay $${grandTotal.toFixed(2)}`}
                                            </Button>
                                        </Paper>
                                    );
                                })
                            ) : (
                                <Alert severity="success" sx={{ borderRadius: 3 }}>
                                    All your stays are currently settled!
                                </Alert>
                            )}
                        </Stack>

                        {walletBalance < balance && balance > 0 && (
                            <Alert severity="warning" sx={{ borderRadius: 3 }}>
                                <Typography variant="caption" fontWeight="bold">
                                    Insufficient funds to pay all stays. Please top up your wallet.
                                </Typography>
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setShowPaymentDialog(false)} sx={{ color: 'text.secondary' }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* --- FEEDBACK SNACKBAR --- */}
            {/* Confirmation Dialog */}
            <Dialog
                open={!!confirmPayment?.open}
                onClose={() => !paying && setConfirmPayment(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Confirm Payment</DialogTitle>
                <DialogContent>
                    {confirmPayment?.booking && (
                        <Stack spacing={2} sx={{ pt: 1, alignItems: 'center' }}>
                            <Avatar
                                src={confirmPayment.booking.dog_photo_url || ''}
                                sx={{ width: 80, height: 80, mb: 1, border: '2px solid rgba(212, 175, 55, 0.5)' }}
                            >
                                <Pets sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography variant="body1" textAlign="center">
                                You are settling a balance for <strong>{confirmPayment.booking.dog_name || 'Pet'}</strong>.
                            </Typography>

                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                                <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary" variant="body2">Service</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {confirmPayment.booking.service_type}
                                            {['cancelled', 'no-show', 'no show'].includes((confirmPayment.booking.status || '').toLowerCase()) ? ' (PER DOG)' : ''}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Subtotal</Typography>
                                        <Typography>${confirmPayment.booking.total_price.toFixed(2)}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">HST (13%)</Typography>
                                        <Typography>${confirmPayment.tax.toFixed(2)}</Typography>
                                    </Stack>
                                    <Divider />
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography fontWeight="bold">Total Charge</Typography>
                                        <Typography fontWeight="bold" color="primary.main" variant="h6">
                                            ${confirmPayment.amount.toFixed(2)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>

                            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                                This amount will be deducted from your wallet immediately.
                            </Alert>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setConfirmPayment(null)} disabled={paying} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={executePayment}
                        disabled={paying}
                        autoFocus
                    >
                        {paying ? <CircularProgress size={24} color="inherit" /> : `Confirm Pay`}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={paymentFeedback.open}
                autoHideDuration={6000}
                onClose={() => setPaymentFeedback({ ...paymentFeedback, open: false })}
            >
                <Alert
                    onClose={() => setPaymentFeedback({ ...paymentFeedback, open: false })}
                    severity={paymentFeedback.severity}
                    sx={{ width: '100%', borderRadius: 3, fontWeight: 'bold' }}
                >
                    {paymentFeedback.text}
                </Alert>
            </Snackbar>

        </ThemeProvider >
    );
}

function HighlightCard({ icon, time, title, desc }: { icon: any, time: string, title: string, desc: string }) {
    return (
        <Paper sx={{ minWidth: 140, p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
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

function CamCard({ name, onClick }: { name: string, onClick?: () => void }) {
    // Randomize slightly to avoid all videos syncing perfectly if we had multiple sources, 
    // but mainly here we just render the video.
    return (
        <Paper
            onClick={onClick}
            sx={{
                width: '100%', position: 'relative', overflow: 'hidden', borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '16/9', bgcolor: '#000',
                cursor: 'pointer', transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)', borderColor: 'rgba(212, 175, 55, 0.3)' }
            }}>
            {/* LIVE Badge */}
            <Box sx={{
                position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', alignItems: 'center', gap: 1,
                bgcolor: 'rgba(220, 38, 38, 0.9)', px: 1.2, py: 0.4, borderRadius: 1,
                backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 0 15px rgba(220, 38, 38, 0.5)'
            }}>
                <Box sx={{
                    width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff',
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.4 },
                        '100%': { opacity: 1 }
                    }
                }} />
                <Typography variant="caption" fontWeight="bold" sx={{ color: '#fff', fontSize: '0.7rem', letterSpacing: 1 }}>
                    LIVE
                </Typography>
            </Box>

            {/* Video Feed */}
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    poster="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" // Fallback image
                >
                    <source src="https://videos.pexels.com/video-files/5532785/5532785-sd_640_360_25fps.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Scanline Overlay for "CCTV" effect */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%)',
                    backgroundSize: '100% 4px',
                    pointerEvents: 'none',
                    zIndex: 1
                }} />
            </Box>

            {/* Camera Info Overlay */}
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 500, opacity: 0.9, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {name}
                    </Typography>
                    <Typography variant="caption" fontFamily="monospace" sx={{ opacity: 0.7, fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                        REC • {formatTimeEST(new Date())}
                    </Typography>
                </Stack>
            </Box>
        </Paper>
    );
}
