"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Stack,
    IconButton,
    ThemeProvider,
    CssBaseline,
    Paper,
    Grid,
    Divider
} from "@mui/material";
import {
    ArrowForward,
    ArrowBack,
    CheckCircle,
    Person,
    Phone,
    Email,
    Lock
} from "@mui/icons-material";
import { theme } from "@/lib/theme";

export default function ClientSignup() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                // Auto-login
                localStorage.setItem('vanguard_token', data.token);
                localStorage.setItem('vanguard_role', data.role);
                localStorage.setItem('vanguard_user', data.name);
                router.push('/client/dashboard');
            } else if (res.status === 409) {
                setError("Account already exists.");
            } else {
                setError("Registration failed.");
            }
        } catch (err) {
            setError("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100dvh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 3
                }}
            >
                {/* Background Ambient Glow */}
                <Box sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(212, 175, 55, 0.03)',
                    filter: 'blur(100px)',
                    zIndex: 0
                }} />

                <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>

                    {/* Back Navigation */}
                    <Link href="/client/login" passHref style={{ textDecoration: 'none' }}>
                        <IconButton sx={{ position: 'absolute', top: -60, left: 0, color: 'text.secondary' }}>
                            <ArrowBack />
                        </IconButton>
                    </Link>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            bgcolor: 'rgba(21, 22, 26, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 4
                        }}
                    >
                        <Stack spacing={4}>

                            {/* Header */}
                            <Box textAlign="center">
                                <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing={2}>
                                    Membership Application
                                </Typography>
                                <Typography variant="h4" color="white" fontWeight={300} sx={{ mt: 1 }}>
                                    Join Vanguard
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 300, mx: 'auto' }}>
                                    Create your secure portal account to manage bookings and live feeds.
                                </Typography>
                            </Box>

                            {/* Form */}
                            <Stack spacing={3}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            InputProps={{ startAdornment: <Person sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} /> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="Phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            InputProps={{ startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} /> }}
                                        />
                                    </Grid>
                                </Grid>

                                <TextField
                                    fullWidth
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{ startAdornment: <Email sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} /> }}
                                />

                                <TextField
                                    fullWidth
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={!!error}
                                    helperText={error}
                                    InputProps={{ startAdornment: <Lock sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} /> }}
                                />

                                <Box sx={{ p: 2, bgcolor: 'rgba(212, 175, 55, 0.05)', borderRadius: 2, display: 'flex', gap: 2 }}>
                                    <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />
                                    <Typography variant="caption" color="text.secondary">
                                        By requesting access, you agree to our specialized care protocols. Approvals processed within 24 hours.
                                    </Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleRegister}
                                    disabled={loading}
                                    endIcon={<ArrowForward />}
                                >
                                    {loading ? "Processing..." : "Submit Application"}
                                </Button>
                            </Stack>

                            <Divider sx={{ opacity: 0.1 }} />

                            <Stack direction="row" justifyContent="center" spacing={1}>
                                <Typography variant="caption" color="text.secondary">Already a member?</Typography>
                                <Link href="/client/login" style={{ textDecoration: 'none' }}>
                                    <Typography variant="caption" color="primary" fontWeight="bold">Sign In</Typography>
                                </Link>
                            </Stack>

                        </Stack>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
