"use client";

import {
    Box,
    Typography,
    Stack,
    IconButton,
    Avatar,
    Tooltip,
    Divider,
    Button,
    ThemeProvider,
    CssBaseline,
    Switch,
    Snackbar,
    Alert
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    Message as MessageIcon,
    Pets as PetsIcon,
    Assignment as AssignmentIcon,
    Logout,
    Settings,
    Menu as MenuIcon,
    ChevronLeft,
    Face
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createTheme } from "@mui/material/styles";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { startRegistration } from '@simplewebauthn/browser';

// Distinct "Utility" Theme for Staff (Blue/Slate vs Client Gold/Black)
const staffTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6', // Bright Blue
        },
        secondary: {
            main: '#64748b', // Slate
        },
        background: {
            default: '#0f172a', // Slate 900
            paper: '#1e293b',   // Slate 800
        },
        text: {
            primary: '#f1f5f9', // Slate 100
            secondary: '#94a3b8', // Slate 400
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [userRole, setUserRole] = useState<string | null>(null);
    const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState({ text: "", severity: "info" as any, open: false });

    useEffect(() => {
        // Enforce Staff Role
        const role = localStorage.getItem('vanguard_role');
        const token = localStorage.getItem('vanguard_token');
        setUserRole(role);

        // Check Face ID status
        const faceId = localStorage.getItem('vanguard_faceid_enabled');
        setIsFaceIdEnabled(faceId === 'true');

        if (!token || (role !== 'staff' && role !== 'owner')) {
            router.push('/');
        }
    }, [router]);

    const handleFaceIdToggle = async () => {
        if (isFaceIdEnabled) {
            // Unregister logic
            localStorage.removeItem('vanguard_faceid_enabled');
            setIsFaceIdEnabled(false);
            setMessage({ text: "Face ID Disabled", severity: "info", open: true });
        } else {
            // Register Logic
            setIsRegistering(true);
            try {
                const email = localStorage.getItem('vanguard_email');
                if (!email) throw new Error("No email found");

                const resStart = await fetch(`${API_BASE_URL}/api/auth/webauthn/register/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const options = await resStart.json();

                // Standardize options
                const authOptions = options.publicKey || options;
                const cleanOptions = { ...authOptions };
                if (cleanOptions.challenge_id) delete (cleanOptions as any).challenge_id;

                const attResp = await startRegistration(cleanOptions);

                const resFinish = await fetch(`${API_BASE_URL}/api/auth/webauthn/register/finish`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ challenge_id: options.challenge_id, response: attResp })
                });

                if (resFinish.ok) {
                    setIsFaceIdEnabled(true);
                    localStorage.setItem('vanguard_faceid_enabled', 'true');
                    setMessage({ text: "Face ID Activated!", severity: "success", open: true });
                } else {
                    throw new Error("Verification Failed");
                }
            } catch (err: any) {
                console.error(err);
                setMessage({ text: "Registration Failed", severity: "error", open: true });
            } finally {
                setIsRegistering(false);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('vanguard_token');
        localStorage.removeItem('vanguard_role');
        localStorage.removeItem('vanguard_user');
        localStorage.removeItem('vanguard_email');
        router.push('/');
    };

    const navItems = [
        { label: "Daily Run", icon: <DashboardIcon />, path: "/staff/dashboard" },
        ...(userRole === 'owner' ? [
            { label: "Comms Log", icon: <MessageIcon />, path: "/staff/comms" },
            { label: "System Audit", icon: <Settings />, path: "/staff/audit" },
        ] : []),
    ];

    return (
        <ThemeProvider theme={staffTheme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

                {/* Sidebar */}
                <motion.div
                    animate={{ width: isSidebarOpen ? 240 : 72 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{
                        borderRight: '1px solid rgba(148, 163, 184, 0.1)',
                        background: '#1e293b',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'fixed',
                        height: '100vh',
                        zIndex: 1200
                    }}
                >
                    {/* Header */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
                        {isSidebarOpen && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <PetsIcon sx={{ color: 'white', fontSize: 20 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white', letterSpacing: -0.5 }}>
                                    Staff<span style={{ color: '#3b82f6' }}>Ops</span>
                                </Typography>
                            </Stack>
                        )}
                        <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} size="small" sx={{ color: 'text.secondary' }}>
                            {isSidebarOpen ? <ChevronLeft /> : <MenuIcon />}
                        </IconButton>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

                    {/* Nav Links */}
                    <Stack spacing={1} sx={{ p: 2, flex: 1 }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                                    <Tooltip title={!isSidebarOpen ? item.label : ""} placement="right">
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                                color: isActive ? 'primary.main' : 'text.secondary',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                                    color: isActive ? 'primary.main' : 'text.primary',
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex' }}>
                                                {item.icon}
                                            </Box>
                                            {isSidebarOpen && (
                                                <Typography variant="body2" fontWeight="medium" sx={{ ml: 2 }}>
                                                    {item.label}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Tooltip>
                                </Link>
                            );
                        })}
                    </Stack>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

                    {/* Footer / User */}
                    <Box sx={{ p: 2 }}>
                        {/* Biometric Quick Toggle (Sidebar) */}
                        <Box sx={{
                            mb: 2,
                            p: 1.5,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarOpen ? 'space-between' : 'center',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Tooltip title={!isSidebarOpen ? "Biometric Login" : ""} placement="right">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Face sx={{ color: isFaceIdEnabled ? 'primary.main' : 'text.secondary', fontSize: 20 }} />
                                    {isSidebarOpen && (
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                                            Face ID
                                        </Typography>
                                    )}
                                </Stack>
                            </Tooltip>
                            {isSidebarOpen && (
                                <Switch
                                    size="small"
                                    checked={isFaceIdEnabled}
                                    onChange={handleFaceIdToggle}
                                    disabled={isRegistering}
                                />
                            )}
                        </Box>

                        <Button
                            onClick={handleLogout}
                            fullWidth={isSidebarOpen}
                            sx={{
                                minWidth: 0,
                                p: 1.5,
                                color: 'text.secondary',
                                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }
                            }}
                        >
                            <Logout sx={{ fontSize: 20 }} />
                            {isSidebarOpen && <Typography variant="body2" sx={{ ml: 2 }}>Sign Out</Typography>}
                        </Button>
                    </Box>
                </motion.div>

                {/* Main Content Area */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        ml: isSidebarOpen ? '240px' : '72px',
                        transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        p: 0,
                        overflowX: 'hidden'
                    }}
                >
                    {children}
                </Box>
                <Snackbar
                    open={message.open}
                    autoHideDuration={4000}
                    onClose={() => setMessage({ ...message, open: false })}
                >
                    <Alert severity={message.severity} sx={{ width: '100%', borderRadius: 3 }}>
                        {message.text}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
