"use client";

import { useState, useEffect } from "react";
import { formatDateTimeEST } from "@/lib/dateUtils";
import { Booking } from "@/types";
import {
    Box, Typography, Container, Stack, Paper, Button,
    IconButton, Divider, Avatar, List, ListItem,
    ListItemText, ListItemAvatar, CircularProgress,
    Dialog, AppBar, Toolbar, ThemeProvider, CssBaseline,
    Chip, Snackbar, Alert, Grid, TextField
} from "@mui/material";
import {
    Wallet, Add, ArrowBack, Apple, CreditCard,
    CheckCircle, Security, AccountBalanceWallet,
    CurrencyBitcoin, Diamond, ShieldMoon, InfoOutlined,
    ContentCopy, QrCode2, Hub, PriorityHigh
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { API_BASE_URL, authenticatedFetch } from "@/lib/api";

type Transaction = {
    id: string;
    title: string;
    date: string;
    amount: string;
    isPositive: boolean;
};

const COIN_ICONS: any = {
    'USDC': <Diamond sx={{ color: '#2775ca' }} />,
};

export default function WalletView() {
    const router = useRouter();
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showApplePay, setShowApplePay] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<any>(null);
    const [step, setStep] = useState(0); // 0: init, 1: authenticating, 2: success
    const [feedback, setFeedback] = useState({ open: false, text: "", severity: "info" as "info" | "success" | "error" | "warning" });
    const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);
    const [topUpAmount, setTopUpAmount] = useState("");
    const [selectedTx, setSelectedTx] = useState<any>(null);

    useEffect(() => {
        fetchProfile();
        const stored = localStorage.getItem('vanguard_local_txs');
        if (stored) {
            setLocalTransactions(JSON.parse(stored));
        }
    }, []);

    const [paidBookings, setPaidBookings] = useState<Booking[]>([]);

    const fetchProfile = async () => {
        try {
            const [profileRes, bookingsRes] = await Promise.all([
                authenticatedFetch(`${API_BASE_URL}/api/user/profile`),
                authenticatedFetch(`${API_BASE_URL}/api/user/bookings`)
            ]);

            if (profileRes.ok) {
                const data = await profileRes.json();
                setBalance(data.balance);
            }
            if (bookingsRes.ok) {
                const bookings: Booking[] = await bookingsRes.json();
                // Filter for "Paid" bookings (is_paid = true)
                // We exclude "Pending" even if is_paid is true (unlikely) to avoid clutter
                // We include Cancelled/No Shows if they were paid (fees)
                // We include Cancelled/No Shows if they were paid (fees) OR if they are unpaid debts
                const paid = bookings
                    .filter(b => b.is_paid || (b.total_price > 0 && (b.status as string).toLowerCase() !== 'pending'))
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setPaidBookings(paid);
            }
        } catch (e) {
            console.error("Failed to fetch wallet data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleApplePay = () => {
        setTopUpAmount("");
        setStep(0); // Reset to input step
        setShowApplePay(true);
    };

    const confirmTopUp = async () => {
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) {
            setFeedback({ text: "Please enter a valid amount.", severity: "error", open: true });
            return;
        }
        if (amount > 5000) {
            setFeedback({ text: "Maximum top-up is $5,000.", severity: "error", open: true });
            return;
        }

        setStep(1); // Move to Face ID animation

        try {
            const token = localStorage.getItem('vanguard_token');
            const res = await fetch(`${API_BASE_URL}/api/wallet/topup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: amount })
            });

            if (res.ok) {
                const data = await res.json();
                // Wait for animation
                setTimeout(() => {
                    setStep(2); // Success
                    setBalance(data.balance);

                    // Add to local transactions
                    const newTx: Transaction = {
                        id: Date.now().toString(),
                        title: "Apple Pay Top Up",
                        date: "Just now",
                        amount: `+ $${amount.toFixed(2)}`,
                        isPositive: true
                    };
                    const updatedTxs = [newTx, ...localTransactions];
                    setLocalTransactions(updatedTxs);
                    localStorage.setItem('vanguard_local_txs', JSON.stringify(updatedTxs));
                }, 2000);
            } else {
                setFeedback({ text: "Top-up failed. Try again.", severity: "error", open: true });
                setStep(0);
                setShowApplePay(false);
            }
        } catch (err) {
            console.error(err);
            setFeedback({ text: "Network error.", severity: "error", open: true });
            setShowApplePay(false);
        }
    };

    const handleClose = () => {
        if (step === 2) {
            fetchProfile();
        }
        setShowApplePay(false);
        setStep(0);
    };

    const [paymentToConfirm, setPaymentToConfirm] = useState<Booking | null>(null);

    const handlePayDebt = (bookingId: string) => {
        const booking = paidBookings.find(b => b.id === bookingId);
        if (booking) setPaymentToConfirm(booking);
    };

    const executePayment = async () => {
        if (!paymentToConfirm) return;
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/wallet/pay`, {
                method: 'POST',
                body: JSON.stringify({ booking_id: paymentToConfirm.id })
            });

            if (res.ok) {
                setFeedback({ text: "Payment Successful. Debt Cleared.", severity: "success", open: true });
                fetchProfile();
                setPaymentToConfirm(null);
            } else {
                const data = await res.json();
                setFeedback({ text: data.error || "Payment Failed", severity: "error", open: true });
                if (data.error?.includes("Insufficient")) {
                    setShowApplePay(true);
                }
                setPaymentToConfirm(null);
            }
        } catch (e) {
            setFeedback({ text: "Payment Error", severity: "error", open: true });
        }
    };

    const cryptoAssets = [
        { name: "USDC", full: "USD Coin", price: "$1.00", balance: "0.00", address: "0x742d...44e" },
    ];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: '#050608', pb: 15 }}>
                {/* Header */}
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(5, 6, 8, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Toolbar>
                        <IconButton onClick={() => router.back()} sx={{ color: 'white', mr: 2 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>Payments & Balance</Typography>
                        <Chip label="VIP" size="small" sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', fontWeight: 'bold', border: '1px solid rgba(212, 175, 55, 0.3)' }} />
                    </Toolbar>
                </AppBar>

                <Container maxWidth="sm" sx={{ pt: 4 }}>
                    <Stack spacing={4}>
                        {/* Balance Card - Premium High-Gloss */}
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <Paper sx={{
                                p: 4,
                                borderRadius: 5,
                                background: 'linear-gradient(135deg, #1A1B1F 0%, #0B0C10 100%)',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
                            }}>
                                {/* Animated Background Ornament */}
                                <Box
                                    component={motion.div}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    sx={{ position: 'absolute', top: -100, right: -100, opacity: 0.03 }}
                                >
                                    <ShieldMoon sx={{ fontSize: 300, color: '#D4AF37' }} />
                                </Box>

                                <Stack spacing={1}>
                                    <Typography variant="overline" sx={{ color: '#D4AF37', fontWeight: 900, letterSpacing: 3, opacity: 0.8 }}>
                                        AVAILABLE CAPITAL
                                    </Typography>
                                    <Typography variant="h2" fontWeight="900" sx={{ letterSpacing: -1 }}>
                                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.6 }}>
                                        <Security sx={{ fontSize: 14 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>ENCRYPTED VAULT</Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </motion.div>

                        {/* Outstanding Debt Indicator */}
                        {paidBookings.some(b => !b.is_paid && b.total_price > 0) && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: '#ef4444', width: 40, height: 40 }}><PriorityHigh /></Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold" color="#ef4444">Outstanding Balance</Typography>
                                            <Typography variant="caption" color="rgba(239, 68, 68, 0.8)">Due to cancellation of reserved booking or no show</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="h6" fontWeight="900" color="#ef4444">
                                            ${paidBookings.filter(b => !b.is_paid).reduce((sum, b) => sum + b.total_price, 0).toFixed(2)}
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handlePayDebt(paidBookings.find(b => !b.is_paid)?.id || "")}
                                            sx={{ bgcolor: '#ef4444', color: 'white', '&:hover': { bgcolor: '#d32f2f' } }}
                                        >
                                            Pay Now
                                        </Button>
                                    </Stack>
                                </Paper>
                            </motion.div>
                        )}

                        {/* Traditional Gateways */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1 }}>Instant Liquidity</Typography>
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleApplePay}
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'black',
                                        py: 2,
                                        borderRadius: 4,
                                        '&:hover': { bgcolor: '#f0f0f0' },
                                        display: 'flex',
                                        gap: 1.5,
                                        textTransform: 'none'
                                    }}
                                >
                                    <Apple sx={{ fontSize: 24 }} />
                                    <Typography variant="button" fontWeight="900" sx={{ fontSize: '1rem' }}>Apple Pay</Typography>
                                </Button>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => setFeedback({ text: "[DEMO] Stripe Checkout simulated. No real transaction.", severity: "info", open: true })}
                                    sx={{
                                        py: 2,
                                        borderRadius: 4,
                                        borderColor: 'rgba(99, 91, 255, 0.4)',
                                        bgcolor: 'rgba(99, 91, 255, 0.05)',
                                        display: 'flex',
                                        gap: 1.5,
                                        textTransform: 'none',
                                        color: '#7a73ff',
                                        '&:hover': { bgcolor: 'rgba(99, 91, 255, 0.1)', borderColor: '#635bff' }
                                    }}
                                >
                                    <CreditCard />
                                    <Typography variant="button" fontWeight="bold">Powered by Stripe</Typography>
                                </Button>
                            </Stack>
                        </Box>

                        {/* Digital Assets Section */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1 }}>Digital Assets</Typography>
                            <Paper sx={{ mt: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                <List disablePadding>
                                    {cryptoAssets.map((coin, i) => (
                                        <div key={coin.name}>
                                            <Stack
                                                direction={{ xs: 'column', sm: 'row' }}
                                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                                justifyContent="space-between"
                                                spacing={2}
                                                sx={{ py: 2, px: 2 }}
                                            >
                                                {/* Asset Info */}
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                        {COIN_ICONS[coin.name] || <CurrencyBitcoin />}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="900">{coin.name}</Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.5, display: 'block' }}>
                                                            {coin.full} • {coin.price}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                {/* Balance & Action */}
                                                <Stack direction="row" alignItems="center" spacing={3} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
                                                    <Box sx={{ textAlign: 'right', mr: 3 }}>
                                                        <Typography variant="caption" color="text.secondary" display="block">Balance</Typography>
                                                        <Typography variant="body2" fontWeight="bold">{coin.balance}</Typography>
                                                    </Box>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => setSelectedCoin(coin)}
                                                        sx={{
                                                            color: '#D4AF37',
                                                            borderColor: 'rgba(212, 175, 55, 0.3)',
                                                            fontWeight: 'bold',
                                                            minWidth: 90
                                                        }}
                                                    >
                                                        Deposit
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                            {i < cryptoAssets.length - 1 && <Divider sx={{ opacity: 0.05 }} />}
                                        </div>
                                    ))}
                                </List>
                            </Paper>
                        </Box>

                        {/* Zero Liability Promise */}
                        <Paper sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: 'rgba(74, 222, 128, 0.03)',
                            border: '1px solid rgba(74, 222, 128, 0.1)',
                            position: 'relative'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <ShieldMoon sx={{ color: '#4ade80', fontSize: 32 }} />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#4ade80' }}>
                                        Vanguard Zero-Liability Guarantee
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7, lineHeight: 1.5 }}>
                                        To ensure your total sovereignty, Vanguard **never stores** your credit card numbers, CVVs, or Private Keys.
                                        All transactions are processed through end-to-end encrypted gateways (Stripe & Apple).
                                        We provide the luxury, you maintain the control.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Platform Standards Moved to Booking Flow */}

                        {/* Recent History (Minimalist) */}
                        {/* Recent History */}
                        <Box sx={{ pb: 4 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1 }}>Billing History</Typography>
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {loading ? (
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <CircularProgress size={20} color="inherit" />
                                    </Box>
                                ) : (
                                    <>
                                        {/* Local Top Ups */}
                                        {localTransactions.map(tx => (
                                            <HistoryItem
                                                key={tx.id}
                                                title={tx.title}
                                                date={tx.date}
                                                amount={tx.amount}
                                                isPositive={tx.isPositive}
                                                onClick={() => setSelectedTx({
                                                    title: tx.title,
                                                    date: tx.date,
                                                    amount: tx.amount,
                                                    isPositive: tx.isPositive,
                                                    details: "Wallet top-up via Apple Pay"
                                                })}
                                            />
                                        ))}

                                        {/* Real Paid Bookings */}
                                        {paidBookings.length > 0 ? (
                                            paidBookings.map((b) => {
                                                // Calculate the grand total (Amount + Tax) the user paid
                                                // If it was marked paid by staff manually without price adjustment, we assume full price + tax was settled.
                                                // If it was a No Show / Late Cancel, the total_price stored is the fee.
                                                // We add tax only if it wasn't a flat fee (Fees usually include tax or are exempt? Assuming Add Tax for consistency unless standard).
                                                // Actually, for No Show ($20) / Cancel ($45), let's assume that IS the charge.
                                                // For clear "Services", it's Price * 1.13.

                                                let amount = b.total_price;
                                                let title = `${b.service_type} (${b.dog_name || 'Pet'})`;

                                                // If it's a standard booking (not a fee), add the tax representation
                                                // A heuristic: if status is 'Completed' or 'Checked In' or 'Confirmed' and price > 50, likely standard.
                                                // But cleaner is just to consistently show what they "would have paid".
                                                // Since we don't store transaction records separately yet, we reconstruct it.

                                                // If it's a penalty fee ($20 or $45), we display that flat.
                                                if (amount === 20 || amount === 45) {
                                                    title = amount === 20 ? "No Show Fee" : "Late Cancellation Fee";
                                                } else {
                                                    amount = amount * 1.13; // Add HST for display
                                                }

                                                return (
                                                    <HistoryItem
                                                        key={b.id}
                                                        title={title}
                                                        date={formatDateTimeEST(b.end_date).split(',')[0]} // Use end date as "Billed Date"
                                                        amount={`- $${amount.toFixed(2)}`}
                                                        onClick={() => setSelectedTx({
                                                            title,
                                                            date: formatDateTimeEST(b.end_date),
                                                            amount: `- $${amount.toFixed(2)}`,
                                                            booking: b
                                                        })}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', ml: 1 }}>
                                                No past billing records found.
                                            </Typography>
                                        )}
                                    </>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </Container>

                {/* Crypto Deposit Modal */}
                <Dialog
                    open={!!selectedCoin}
                    onClose={() => setSelectedCoin(null)}
                    PaperProps={{ sx: { bgcolor: '#1A1B1F', borderRadius: 4, backgroundImage: 'none' } }}
                >
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: 'rgba(212,175,55,0.1)' }}>
                            {selectedCoin && (COIN_ICONS[selectedCoin.name] || <CurrencyBitcoin />)}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">Deposit {selectedCoin?.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Send only {selectedCoin?.full} to this address.
                        </Typography>
                        <Chip label="DEMO - No Real Funds" size="small" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 'bold' }} />

                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{selectedCoin?.address}</Typography>
                            <IconButton size="small" onClick={() => {
                                navigator.clipboard.writeText(selectedCoin?.address);
                                setFeedback({ text: "Address copied!", severity: "success", open: true });
                            }}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Paper>

                        <QrCode2 sx={{ fontSize: 180, opacity: 0.8, mb: 3 }} />

                        <Button fullWidth variant="contained" onClick={() => setSelectedCoin(null)} sx={{ bgcolor: 'white', color: 'black', borderRadius: 2 }}>
                            Close
                        </Button>
                    </Box>
                </Dialog>

                {/* Apple Pay Sheet Simulation */}
                <Dialog
                    fullScreen
                    open={showApplePay}
                    onClose={handleClose}
                    PaperProps={{
                        sx: { bgcolor: 'transparent', boxShadow: 'none' }
                    }}
                >
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            bgcolor: 'rgba(0,0,0,0.8)'
                        }}
                    >
                        <AnimatePresence>
                            {showApplePay && (
                                <Box
                                    component={motion.div}
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    sx={{
                                        background: '#1c1c1e',
                                        borderTopLeftRadius: 24,
                                        borderTopRightRadius: 24,
                                        padding: '24px',
                                        paddingBottom: '48px'
                                    }}
                                >
                                    <Stack spacing={3} alignItems="center">
                                        <Apple sx={{ fontSize: 40, color: 'white' }} />
                                        <Chip label="DEMO MODE" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 'bold', fontSize: '0.65rem' }} />

                                        {step === 0 ? (
                                            <>
                                                <Typography variant="h6" fontWeight="bold">Top Up Wallet</Typography>
                                                <Typography variant="body2" color="text.secondary">Enter amount (Max $5,000)</Typography>

                                                <TextField
                                                    autoFocus
                                                    fullWidth
                                                    placeholder="0.00"
                                                    value={topUpAmount}
                                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                                    type="number"
                                                    InputProps={{
                                                        startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>,
                                                        sx: {
                                                            fontSize: '2rem',
                                                            fontWeight: 'bold',
                                                            color: 'white',
                                                            '& input': { textAlign: 'center' }
                                                        }
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            bgcolor: 'rgba(255,255,255,0.05)',
                                                            borderRadius: 3
                                                        }
                                                    }}
                                                />

                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={confirmTopUp}
                                                    disabled={!topUpAmount}
                                                    sx={{
                                                        bgcolor: 'white',
                                                        color: 'black',
                                                        borderRadius: 2,
                                                        fontWeight: 'bold',
                                                        py: 1.5,
                                                        mt: 2
                                                    }}
                                                >
                                                    Pay with Apple Pay
                                                </Button>
                                            </>
                                        ) : step === 1 ? (
                                            <>
                                                <Typography variant="h6" fontWeight="bold">Confirm with Face ID</Typography>
                                                <Typography variant="body2" color="text.secondary">Amount: ${parseFloat(topUpAmount).toFixed(2)}</Typography>
                                                <Box sx={{
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: '50%',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    display: 'flex',
                                                    alignSelf: 'center',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    {/* Animated Scanner Effect */}
                                                    <Box
                                                        component={motion.div}
                                                        animate={{ y: [-60, 60, -60] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, bgcolor: '#D4AF37', boxShadow: '0 0 10px #D4AF37' }}
                                                    />
                                                    <Security sx={{ fontSize: 60, color: '#D4AF37', opacity: 0.5 }} />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">Vanguard Secure Handshake...</Typography>
                                            </>
                                        ) : (
                                            <>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring" }}
                                                >
                                                    <CheckCircle sx={{ fontSize: 80, color: '#34c759' }} />
                                                </motion.div>
                                                <Typography variant="h6" fontWeight="bold">Authenticated Successfully</Typography>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={handleClose}
                                                    sx={{ bgcolor: 'white', color: 'black', borderRadius: 2, fontWeight: 'bold' }}
                                                >
                                                    Done
                                                </Button>
                                            </>
                                        )}
                                    </Stack>
                                </Box>
                            )}
                        </AnimatePresence>
                    </Box>
                </Dialog>

            </Snackbar>

            {/* Payment Confirmation Dialog */}
            <Dialog
                open={!!paymentToConfirm}
                onClose={() => setPaymentToConfirm(null)}
                PaperProps={{ sx: { bgcolor: '#1A1B1F', borderRadius: 4, minWidth: 320, p: 3 } }}
            >
                <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>Confirm Payment</Typography>

                <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                    You are about to pay <span style={{ color: 'white', fontWeight: 'bold' }}>${paymentToConfirm?.total_price.toFixed(2)}</span> to {
                        ['cancelled', 'no-show', 'no show'].includes((paymentToConfirm?.status || '').toLowerCase())
                            ? "settle outstanding balances due to no show/cancelling a confirmed booking."
                            : "pay for a confirmed booking."
                    }
                </Typography>

                <Stack spacing={2}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={executePayment}
                        sx={{ bgcolor: '#D4AF37', color: 'black', fontWeight: 'bold' }}
                    >
                        Confirm Payment
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setPaymentToConfirm(null)}
                        sx={{ color: 'white', opacity: 0.7 }}
                    >
                        Cancel
                    </Button>
                </Stack>
            </Dialog>

            {/* Transaction Detail Modal */}
            <Dialog
                open={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                PaperProps={{ sx: { bgcolor: '#1A1B1F', borderRadius: 4, minWidth: 320 } }}
            >
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: selectedTx?.isPositive ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                        {selectedTx?.isPositive ? <Add sx={{ color: '#4ade80' }} /> : <AccountBalanceWallet sx={{ color: '#ef4444' }} />}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{selectedTx?.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>{selectedTx?.date}</Typography>

                    <Typography variant="h4" fontWeight="900" sx={{ mb: 1, color: selectedTx?.isPositive ? '#4ade80' : 'white' }}>
                        {selectedTx?.amount}
                    </Typography>
                    {selectedTx?.details && (
                        <Chip label={selectedTx.details} sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.05)' }} />
                    )}

                    {selectedTx?.booking && (
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'left', bgcolor: 'rgba(0,0,0,0.2)', mb: 3 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">BOOKING DETAILS</Typography>
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                <Typography variant="body2">Service:</Typography>
                                <Typography variant="body2" fontWeight="bold">{selectedTx.booking.service_type}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                <Typography variant="body2">Status:</Typography>
                                <Chip label={selectedTx.booking.status} size="small" color={selectedTx.booking.status.toLowerCase() === 'cancelled' ? 'error' : 'default'} sx={{ height: 20, fontSize: '0.7rem' }} />
                            </Stack>
                            {!selectedTx.booking.is_paid && (
                                <Alert severity="warning" icon={false} sx={{ mt: 2, py: 0 }}>
                                    <Typography variant="caption" color="warning.main" fontWeight="bold">Payment Pending</Typography>
                                </Alert>
                            )}
                        </Paper>
                    )}

                    <Button fullWidth variant="contained" onClick={() => setSelectedTx(null)} sx={{ bgcolor: 'white', color: 'black' }}>
                        Close Receipt
                    </Button>
                </Box>
            </Dialog>
        </Box>
        </ThemeProvider >
    );
}

function HistoryItem({ title, date, amount, isPositive, onClick }: any) {
    return (
        <Paper
            onClick={onClick}
            sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
                '&:hover': onClick ? { bgcolor: 'rgba(255,255,255,0.05)', transform: 'translateY(-2px)' } : {}
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: isPositive ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)', color: isPositive ? '#4ade80' : 'inherit' }}>
                        {isPositive ? <Add /> : <AccountBalanceWallet />}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight="bold">{title}</Typography>
                        <Typography variant="caption" color="text.secondary">{date}</Typography>
                    </Box>
                </Stack>
                <Typography variant="body2" fontWeight="900" sx={{ color: isPositive ? '#4ade80' : 'inherit' }}>
                    {amount}
                </Typography>
            </Stack>
        </Paper>
    );
}
