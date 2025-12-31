"use client";

import { useState } from "react";
import {
    Box, Typography, Container, Stack, Paper, Button,
    IconButton, Divider, Avatar, List, ListItem,
    ListItemText, ListItemAvatar, CircularProgress,
    Dialog, AppBar, Toolbar, ThemeProvider, CssBaseline
} from "@mui/material";
import {
    Wallet, Add, ArrowBack, Apple, CreditCard,
    CheckCircle, Security, AccountBalanceWallet
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";

export default function WalletView() {
    const router = useRouter();
    const [balance, setBalance] = useState(125.50);
    const [showApplePay, setShowApplePay] = useState(false);
    const [step, setStep] = useState(0); // 0: init, 1: authenticating, 2: success

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

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
                {/* Header */}
                <AppBar position="static" elevation={0} sx={{ bgcolor: 'rgba(5, 6, 8, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Toolbar>
                        <IconButton onClick={() => router.back()} sx={{ color: 'white', mr: 2 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" fontWeight="bold">Vanguard Wallet</Typography>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="sm" sx={{ pt: 4 }}>
                    <Stack spacing={4}>
                        {/* Balance Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #D4AF37 0%, #B89626 100%)',
                                color: 'black',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                            }}>
                                <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                                    <Wallet sx={{ fontSize: 150 }} />
                                </Box>
                                <Typography variant="overline" sx={{ fontWeight: 'bold', letterSpacing: 1.5, opacity: 0.8 }}>Current Balance</Typography>
                                <Typography variant="h3" fontWeight="900" sx={{ my: 1 }}>${balance.toFixed(2)}</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Security sx={{ fontSize: 16 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Secured by Vanguard Shield</Typography>
                                </Stack>
                            </Paper>
                        </motion.div>

                        {/* Top Up Options */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1 }}>Top Up Funds</Typography>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleApplePay}
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'black',
                                        py: 1.5,
                                        borderRadius: 3,
                                        '&:hover': { bgcolor: '#f0f0f0' },
                                        display: 'flex',
                                        gap: 1.5,
                                        textTransform: 'none'
                                    }}
                                >
                                    <Apple sx={{ fontSize: 24 }} />
                                    <Typography variant="button" fontWeight="bold" sx={{ fontSize: '1rem' }}>Pay with Apple Pay</Typography>
                                </Button>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        gap: 1.5,
                                        textTransform: 'none',
                                        color: 'white'
                                    }}
                                >
                                    <CreditCard />
                                    <Typography variant="button">Add Credit or Debit Card</Typography>
                                </Button>
                            </Stack>
                        </Box>

                        {/* History */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1 }}>Recent Activity</Typography>
                            <Paper sx={{ mt: 1, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <List disablePadding>
                                    <TransactionItem
                                        title="Boarding Payment"
                                        date="Today"
                                        amount={-75.00}
                                        icon={<AccountBalanceWallet sx={{ color: '#ef4444' }} />}
                                    />
                                    <Divider sx={{ opacity: 0.05 }} />
                                    <TransactionItem
                                        title="Top Up (Apple Pay)"
                                        date="Yesterday"
                                        amount={50.00}
                                        icon={<Apple sx={{ color: '#D4AF37' }} />}
                                    />
                                    <Divider sx={{ opacity: 0.05 }} />
                                    <TransactionItem
                                        title="Grooming Tip"
                                        date="Oct 12"
                                        amount={-15.00}
                                        icon={<AccountBalanceWallet sx={{ color: '#ef4444' }} />}
                                    />
                                </List>
                            </Paper>
                        </Box>
                    </Stack>
                </Container>

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

                                        {step === 1 ? (
                                            <>
                                                <Typography variant="h6" fontWeight="bold">Confirm with Face ID</Typography>
                                                <Typography variant="body2" color="text.secondary">Amount: $50.00</Typography>
                                                <Box sx={{
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: '50%',
                                                    border: '4px solid #D4AF37',
                                                    display: 'flex',
                                                    alignSelf: 'center',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    position: 'relative'
                                                }}>
                                                    <motion.div
                                                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                    >
                                                        <Security sx={{ fontSize: 60, color: '#D4AF37' }} />
                                                    </motion.div>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">Processing Secure Handshake...</Typography>
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
                                                <Typography variant="h6" fontWeight="bold">Payment Complete</Typography>
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
            </Box>
        </ThemeProvider>
    );
}

function TransactionItem({ title, date, amount, icon }: any) {
    const isPositive = amount > 0;
    return (
        <ListItem sx={{ py: 1.5 }}>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>{icon}</Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={<Typography variant="body2" fontWeight="bold">{title}</Typography>}
                secondary={<Typography variant="caption" color="text.secondary">{date}</Typography>}
            />
            <Typography variant="body2" fontWeight="bold" color={isPositive ? 'primary.main' : '#ef4444'}>
                {isPositive ? '+' : ''}{amount.toFixed(2)}
            </Typography>
        </ListItem>
    );
}
