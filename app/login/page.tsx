"use client";

import { useState } from "react";
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
    InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff, Face, ArrowBack } from "@mui/icons-material";
import { theme } from "@/lib/theme";

export default function UnifiedLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // Mock Auth Logic
        if (email.toLowerCase().includes('staff') || email.toLowerCase().includes('admin')) {
            router.push('/staff/login'); // Or direct to staff dashboard if we were fully integrated
        } else {
            router.push('/client/dashboard');
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
            </Box>
        </ThemeProvider>
    );
}
