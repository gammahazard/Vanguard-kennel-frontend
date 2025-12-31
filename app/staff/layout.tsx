"use client";

import { Box, Typography, Stack, IconButton, Avatar, Tooltip, Divider, Button, ThemeProvider, CssBaseline } from "@mui/material";
import {
    Dashboard as DashboardIcon,
    Message as MessageIcon,
    Pets as PetsIcon,
    Assignment as AssignmentIcon,
    Logout,
    Settings,
    Menu as MenuIcon,
    ChevronLeft
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createTheme } from "@mui/material/styles";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        // Enforce Staff Role
        const role = localStorage.getItem('vanguard_role');
        const token = localStorage.getItem('vanguard_token');

        if (!token || (role !== 'staff' && role !== 'owner')) {
            router.push('/staff/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('vanguard_token');
        localStorage.removeItem('vanguard_role');
        localStorage.removeItem('vanguard_user');
        router.push('/');
    };

    const navItems = [
        { label: "Daily Run", icon: <DashboardIcon />, path: "/staff/dashboard" },
        { label: "Comms Log", icon: <MessageIcon />, path: "/staff/comms" },
        // Future features
        // { label: "Incidents", icon: <AssignmentIcon />, path: "/staff/incidents" },
        // { label: "Guests", icon: <PetsIcon />, path: "/staff/guests" }, 
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
            </Box>
        </ThemeProvider>
    );
}
