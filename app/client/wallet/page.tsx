"use client";

import { useState } from "react";
import {
    Box, Typography, Container, Stack, Paper, Button,
    IconButton, Divider, Avatar, List, ListItem,
    ListItemText, ListItemAvatar, CircularProgress,
    Dialog, AppBar, Toolbar, ThemeProvider, CssBaseline,
    Chip, Snackbar, Alert
} from "@mui/material";
import {
    Wallet, Add, ArrowBack, Apple, CreditCard,
    CheckCircle, Security, AccountBalanceWallet,
    CurrencyBitcoin, Diamond, ShieldMoon, InfoOutlined,
    ContentCopy, QrCode2, Hub
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";

export default function WalletView() {
    const router = useRouter();
    const [balance, setBalance] = useState(125.50);
    const [showApplePay, setShowApplePay] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<any>(null);
    const [step, setStep] = useState(0); // 0: init, 1: authenticating, 2: success
    const [feedback, setFeedback] = useState({ open: false, text: "", severity: "info" as "info" | "success" | "error" | "warning" });

    const handleApplePay = () => {
        setShowApplePay(true);
        setStep(1);
        setTimeout(() => setStep(2), 2500); // Simulate biometric auth
    };

    const handleClose = () => {
        if (step === 2) {
            setBalance(prev => prev + 50.00);
        }
        setShowApplePay(false);
        setStep(0);
    };

    const cryptoAssets = [
        { name: "USDC", full: "USD Coin", icon: <Diamond sx={{ color: '#2775ca' }} />, price: "$1.00", balance: "0.00", address: "0x742d...44e" },
        { name: "USDT", full: "Tether", icon: <Diamond sx={{ color: '#26a17b' }} />, price: "$1.00", balance: "0.00", address: "0x911a...32c" },
        { name: "ETH", full: "Ethereum", icon: <Hub sx={{ color: '#627eea' }} />, price: "$2,450.12", balance: "0.00", address: "0x22d...11b" },
        { name: "BTC", full: "Bitcoin", icon: <CurrencyBitcoin sx={{ color: '#f7931a' }} />, price: "$43,120.50", balance: "0.00", address: "bc1q...88x" },
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
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>Vanguard Finance</Typography>
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
                                            <ListItem
                                                secondaryAction={
                                                    <Button size="small" variant="text" sx={{ color: '#D4AF37', fontWeight: 'bold' }} onClick={() => setSelectedCoin(coin)}>Deposit</Button>
                                                }
                                                sx={{ py: 2 }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                        {coin.icon}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={<Typography variant="body2" fontWeight="900">{coin.name}</Typography>}
                                                    secondary={<Typography variant="caption" sx={{ opacity: 0.5 }}>{coin.full} • {coin.price}</Typography>}
                                                />
                                                <Box sx={{ textAlign: 'right', mr: 2 }}>
                                                    <Typography variant="body2" fontWeight="bold">{coin.balance}</Typography>
                                                </Box>
                                            </ListItem>
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

                        {/* Recent History (Minimalist) */}
                        <Box sx={{ pb: 4 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1 }}>History</Typography>
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                <HistoryItem title="Vanguard Premium Boarding" date="Today" amount="-75.00" />
                                <HistoryItem title="Apple Pay Top Up" date="Yesterday" amount="+50.00" isPositive />
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
                            {selectedCoin?.icon}
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

                                        {step === 1 ? (
                                            <>
                                                <Typography variant="h6" fontWeight="bold">Confirm with Face ID</Typography>
                                                <Typography variant="body2" color="text.secondary">Amount: $50.00</Typography>
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

                <Snackbar
                    open={feedback.open}
                    autoHideDuration={4000}
                    onClose={() => setFeedback({ ...feedback, open: false })}
                >
                    <Alert severity={feedback.severity} sx={{ borderRadius: 3, fontWeight: 'bold' }}>{feedback.text}</Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}

function HistoryItem({ title, date, amount, isPositive }: any) {
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'transparent', borderColor: 'rgba(255,255,255,0.05)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="body2" fontWeight="bold">{title}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>{date}</Typography>
                </Box>
                <Typography variant="body2" fontWeight="900" sx={{ color: isPositive ? '#4ade80' : 'inherit' }}>
                    {amount}
                </Typography>
            </Stack>
        </Paper>
    );
}
