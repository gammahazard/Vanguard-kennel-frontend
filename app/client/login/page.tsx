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
    InputAdornment,
    IconButton,
    ThemeProvider,
    CssBaseline,
    Divider
} from "@mui/material";
import { Visibility, VisibilityOff, Face, ArrowBack } from "@mui/icons-material";
import { theme } from "@/lib/theme";

export default function ClientLogin() {
    const router = useRouter(); // Use App Router
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
                // Store token (Securely this should be HttpOnly cookie, but for demo localStorage is fine)
                localStorage.setItem('vanguard_token', data.token);
                localStorage.setItem('vanguard_role', data.role);
                localStorage.setItem('vanguard_user', data.name);

                // Route based on role
                if (data.role === 'staff' || data.role === 'owner') {
                    router.push('/staff/dashboard'); // Placeholder for now
                } else {
                    router.push('/client/dashboard');
                }
            } else {
                setError("Invalid email or password");
            }
        } catch (err) {
            console.error("Login Failed", err);
            setError("Connection to server failed");
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
                                WELCOME BACK
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Access your pet's dashboard
                            </Typography>
                        </Box>

                        <Stack spacing={3} width="100%">
                            <TextField
                                fullWidth
                                placeholder="Email or Phone"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!error}
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
                                sx={{ py: 2, fontSize: '1rem' }}
                            >
                                {loading ? "Verifying..." : "Login"}
                            </Button>
                        </Stack>

                        <Divider sx={{ width: '100%', opacity: 0.1 }}>OR</Divider>

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Face />}
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

                        <Stack direction="row" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                                New here?
                            </Typography>
                            <Link href="/client/signup" style={{ textDecoration: 'none' }}>
                                <Typography variant="caption" color="primary" fontWeight="bold">
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
