"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    Divider,
    InputAdornment,
    Alert,
    Snackbar
} from "@mui/material";
import { Visibility, VisibilityOff, Face, ArrowBack } from "@mui/icons-material";
import { theme } from "@/lib/theme";

import { startAuthentication } from '@simplewebauthn/browser';
import { API_BASE_URL } from "@/lib/config";

export default function UnifiedLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", open: false });
    const [faceIdAvailable, setFaceIdAvailable] = useState(false);

    useEffect(() => {
        const enabled = localStorage.getItem('vanguard_faceid_enabled');
        if (enabled === 'true') {
            setFaceIdAvailable(true);
        }
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('vanguard_user', data.name);
                localStorage.setItem('vanguard_role', data.role);
                localStorage.setItem('vanguard_email', email);

                if (data.role === 'staff' || data.role === 'owner') {
                    router.push('/staff/dashboard');
                } else {
                    router.push('/client/dashboard');
                }
            } else {
                const errorText = await res.text();
                setMessage({ text: errorText || "Authentication failed. Check credentials.", open: true });
            }
        } catch (err) {
            setMessage({ text: "Connection error. Backend might be offline.", open: true });
        } finally {
            setLoading(false);
        }
    };

    const handleFaceIdLogin = async () => {
        if (!email) {
            setMessage({ text: "Enter your email first to start Face ID login.", open: true });
            return;
        }

        try {
            const resStart = await fetch(`${API_BASE_URL}/api/auth/webauthn/login/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!resStart.ok) throw new Error("No Face ID found for this account.");
            const options = await resStart.json();

            const attResp = await startAuthentication(options.public_key);

            const resFinish = await fetch(`${API_BASE_URL}/api/auth/webauthn/login/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge_id: options.challenge_id, response: attResp })
            });

            if (resFinish.ok) {
                const data = await resFinish.json();
                localStorage.setItem('vanguard_user', data.name);
                localStorage.setItem('vanguard_role', data.role);
                localStorage.setItem('vanguard_email', email);
                router.push('/client/dashboard');
            } else {
                throw new Error("Verification failed.");
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Face ID login failed", open: true });
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
                {/* Background Glow */}
                <Box sx={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-20%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(212, 175, 55, 0.05)',
                    filter: 'blur(100px)',
                    zIndex: 0
                }} />

                {/* Back Navigation */}
                <Link href="/" passHref style={{ textDecoration: 'none' }}>
                    <IconButton sx={{ position: 'absolute', top: 20, left: 20, color: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
                        <ArrowBack />
                    </IconButton>
                </Link>

                <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack spacing={4} alignItems="center">

                        {/* Logo */}
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 4,
                            bgcolor: 'rgba(212, 175, 55, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            border: '1px solid rgba(212, 175, 55, 0.2)'
                        }}>
                            <Typography variant="h3" fontWeight="bold" color="primary">V</Typography>
                        </Box>

                        <Box textAlign="center">
                            <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: '0.1em', mb: 1 }}>
                                WELCOME
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please sign in to continue
                            </Typography>
                        </Box>

                        <Stack spacing={3} width="100%">
                            <TextField
                                fullWidth
                                placeholder="Email, Phone, or Staff ID"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                placeholder="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleLogin}
                                sx={{ py: 2, fontSize: '1rem' }}
                            >
                                Sign In
                            </Button>
                        </Stack>

                        {faceIdAvailable && (
                            <>
                                <Divider sx={{ width: '100%', opacity: 0.1 }}>OR</Divider>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Face />}
                                    onClick={handleFaceIdLogin}
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: 'text.secondary',
                                        py: 1.5,
                                        '&:hover': {
                                            borderColor: '#fff',
                                            color: '#fff'
                                        }
                                    }}
                                >
                                    Log in with Face ID
                                </Button>
                            </>
                        )}

                        <Stack direction="row" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                                No account?
                            </Typography>
                            <Link href="/client/signup" style={{ textDecoration: 'none' }}>
                                <Typography variant="caption" color="primary" fontWeight="bold">
                                    Apply for Membership
                                </Typography>
                            </Link>
                        </Stack>
                    </Stack>
                </Container>

                <Snackbar
                    open={message.open}
                    autoHideDuration={6000}
                    onClose={() => setMessage({ ...message, open: false })}
                >
                    <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
                        {message.text}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
