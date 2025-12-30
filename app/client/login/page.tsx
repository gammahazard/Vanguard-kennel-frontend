"use client";

import { useState, useEffect } from "react";
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
    InputAdornment,
    IconButton,
    ThemeProvider,
    CssBaseline,
    Divider,
    Alert,
    Snackbar
} from "@mui/material";
import { Visibility, VisibilityOff, Face, ArrowBack } from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { startAuthentication } from '@simplewebauthn/browser';

export default function ClientLogin() {
    const router = useRouter(); // Use App Router
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [faceIdAvailable, setFaceIdAvailable] = useState(false);

    useEffect(() => {
        const enabled = localStorage.getItem('vanguard_faceid_enabled');
        const lastEmail = localStorage.getItem('vanguard_email');
        if (enabled === 'true') setFaceIdAvailable(true);
        if (lastEmail) setEmail(lastEmail);
    }, []);

    const checkEmail = async (currentEmail: string) => {
        if (currentEmail.includes('@') && currentEmail.includes('.')) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/check?email=${encodeURIComponent(currentEmail)}`);
                const data = await res.json();
                if (data.faceid_registered) {
                    setFaceIdAvailable(true);
                    localStorage.setItem('vanguard_faceid_enabled', 'true');
                } else {
                    const stored = localStorage.getItem('vanguard_faceid_enabled');
                    if (stored !== 'true') setFaceIdAvailable(false);
                }
            } catch (err) {
                console.error("Face ID check failed:", err);
            }
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Login Success:", data);
                localStorage.setItem('vanguard_token', data.token);
                localStorage.setItem('vanguard_role', data.role);
                localStorage.setItem('vanguard_user', data.name);
                localStorage.setItem('vanguard_email', email);
                localStorage.setItem('vanguard_faceid_enabled', data.faceid_enabled ? 'true' : 'false');

                if (data.role === 'staff' || data.role === 'owner') {
                    router.push('/staff/dashboard');
                } else {
                    router.push('/client/dashboard');
                }
            } else {
                const errorText = await res.text();
                setError(errorText || "Invalid email or password");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFaceIdLogin = async () => {
        if (!email) {
            setError("Enter your email first to start Face ID login.");
            return;
        }

        try {
            const resStart = await fetch(`${API_BASE_URL}/api/auth/webauthn/login/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!resStart.ok) {
                const errorText = await resStart.text();
                throw new Error(errorText || "No Face ID found for this account.");
            }
            const options = await resStart.json();
            console.log("📦 WebAuthn Challenge:", options);

            // Standardize the options for the browser
            const authOptions = options.publicKey || options;

            // CRITICAL: Remove extra fields that are NOT part of the WebAuthn spec
            // to avoid confusing the browser/library
            const cleanOptions = { ...authOptions };
            if (cleanOptions.challenge_id) delete (cleanOptions as any).challenge_id;

            const attResp = await startAuthentication(cleanOptions);

            const resFinish = await fetch(`${API_BASE_URL}/api/auth/webauthn/login/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge_id: options.challenge_id, response: attResp })
            });

            if (resFinish.ok) {
                const data = await resFinish.json();
                localStorage.setItem('vanguard_token', data.token);
                localStorage.setItem('vanguard_user', data.name);
                localStorage.setItem('vanguard_role', data.role);
                localStorage.setItem('vanguard_email', email);
                localStorage.setItem('vanguard_faceid_enabled', 'true');
                router.push('/client/dashboard');
            } else {
                const errorText = await resFinish.text();
                throw new Error(errorText || "Verification failed.");
            }
        } catch (err: any) {
            setError(err.message || "Face ID login failed");
        }
    };

    // Dynamically check if Face ID is available for this email
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkEmail(email);
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [email]);

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

                        {/* FACE ID BUTTON - Very Top if available! */}
                        {faceIdAvailable && (
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<Face />}
                                onClick={handleFaceIdLogin}
                                sx={{
                                    py: 2,
                                    bgcolor: 'primary.main',
                                    color: '#000',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    mb: -1,
                                    '&:hover': { bgcolor: '#fff' }
                                }}
                            >
                                Fast Login with Face ID
                            </Button>
                        )}

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
                                WELCOME BACK
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {faceIdAvailable ? "Use biometrics for a faster entry" : "Access your pet's dashboard"}
                            </Typography>
                        </Box>

                        <Stack spacing={3} width="100%">
                            {faceIdAvailable && <Divider sx={{ opacity: 0.1 }}>OR USE PASSWORD</Divider>}

                            <TextField
                                fullWidth
                                placeholder="Email or Phone"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => checkEmail(email)}
                                error={!!error}
                                InputProps={{
                                    endAdornment: faceIdAvailable ? (
                                        <InputAdornment position="end">
                                            <Face color="primary" sx={{ opacity: 0.8 }} />
                                        </InputAdornment>
                                    ) : null
                                }}
                            />
                            <TextField
                                fullWidth
                                placeholder="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!error}
                                helperText={error}
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
                                disabled={loading}
                                sx={{
                                    py: 2,
                                    fontSize: '1rem',
                                    bgcolor: faceIdAvailable ? 'rgba(255,255,255,0.05)' : 'primary.main',
                                    color: faceIdAvailable ? '#fff' : '#000',
                                    border: faceIdAvailable ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                }}
                            >
                                {loading ? "Verifying..." : "Login"}
                            </Button>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            sx={{ mt: 2, width: '100%' }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                New here?
                            </Typography>
                            <Link href="/client/signup" style={{ textDecoration: 'none' }}>
                                <Typography variant="body2" color="primary" fontWeight="bold">
                                    Create Account
                                </Typography>
                            </Link>
                        </Stack>
                    </Stack>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
