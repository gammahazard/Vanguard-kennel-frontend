"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "@mui/material";
import { Visibility, VisibilityOff, Security, Lock, ArrowBack } from "@mui/icons-material";
import { theme } from "@/lib/theme";

export default function StaffLogin() {
    const [showPassword, setShowPassword] = useState(false);

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
                {/* Background Tech Glow */}
                <Box sx={{
                    position: 'absolute',
                    bottom: '-30%',
                    left: '-20%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    bgcolor: 'rgba(59, 130, 246, 0.05)', // Blue tint for Staff
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
                    <Stack spacing={5} alignItems="center">

                        {/* Security Icon */}
                        <Box sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1
                        }}>
                            <Security sx={{ fontSize: 32, color: 'text.secondary' }} />
                        </Box>

                        <Box textAlign="center">
                            <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.2em', fontWeight: 'bold' }}>
                                Vanguard Systems
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                                Staff Portal
                            </Typography>
                        </Box>

                        <Stack spacing={3} width="100%">
                            <TextField
                                fullWidth
                                placeholder="Staff ID"
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography color="text.secondary">#</Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                placeholder="Passkey"
                                type={showPassword ? 'text' : 'password'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
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

                            <Link href="/dashboard" passHref style={{ textDecoration: 'none' }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        py: 2,
                                        background: '#333', // More neutral for staff
                                        '&:hover': { background: '#444' }
                                    }}
                                >
                                    Authenticate
                                </Button>
                            </Link>
                        </Stack>

                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <Typography variant="caption" color="text.secondary">
                                Return to Gateway
                            </Typography>
                        </Link>
                    </Stack>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
