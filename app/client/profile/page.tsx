"use client";

import { useState } from "react";
import {
    Box, Typography, Container, Stack, Paper, Avatar,
    BottomNavigation, BottomNavigationAction, ThemeProvider, CssBaseline,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListItemSecondaryAction, Switch, Divider, Button
} from "@mui/material";
import { Home, Pets, CalendarMonth, Person, Face, Notifications, CreditCard, Security, ChevronRight, Logout } from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function ProfileView() {
    const router = useRouter();
    const [navValue, setNavValue] = useState(3); // Index 3 is Profile

    const handleNavChange = (newValue: number) => {
        setNavValue(newValue);
        if (newValue === 0) router.push('/client/dashboard');
        if (newValue === 1) router.push('/client/pets');
        if (newValue === 2) router.push('/client/bookings');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>

                <Container maxWidth="sm" sx={{ pt: 4 }}>
                    <Stack spacing={4}>

                        {/* Header Profile */}
                        <Stack alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 'bold', mb: 1 }}>J</Avatar>
                            <Typography variant="h5" fontWeight="bold">James Wilson</Typography>
                            <Typography variant="body2" color="text.secondary">Member since 2023</Typography>
                            <Chip label="Gold Member" size="small" sx={{ bgcolor: 'rgba(212,175,55,0.2)', color: 'primary.main', fontWeight: 'bold' }} />
                        </Stack>

                        {/* Settings Groups */}
                        <Stack spacing={2}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1 }}>Preferences</Typography>
                            <Paper sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                                <List disablePadding>

                                    <SettingsItem icon={<Face />} title="Face ID Login" hasSwitch={true} />
                                    <Divider sx={{ opacity: 0.05 }} />
                                    <SettingsItem icon={<Notifications />} title="Push Notifications" hasSwitch={true} defaultChecked />
                                    <Divider sx={{ opacity: 0.05 }} />
                                    <SettingsItem icon={<Security />} title="Two-Factor Auth" />

                                </List>
                            </Paper>

                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1, mt: 2 }}>Payment</Typography>
                            <Paper sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                                <List disablePadding>
                                    <SettingsItem icon={<CreditCard />} title="Payment Methods" subtitle="Visa •••• 4242" />
                                </List>
                            </Paper>
                        </Stack>

                        <Link href="/" passHref style={{ textDecoration: 'none' }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Logout />}
                                fullWidth
                                sx={{ py: 1.5, borderRadius: 3, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                            >
                                Sign Out
                            </Button>
                        </Link>

                    </Stack>
                </Container>

                {/* Bottom Nav */}
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={navValue}
                        onChange={(event, newValue) => handleNavChange(newValue)}
                        sx={{ bgcolor: '#0B0C10', height: 70, '& .Mui-selected': { color: '#D4AF37 !important' } }}
                    >
                        <BottomNavigationAction label="Home" icon={<Home />} />
                        <BottomNavigationAction label="Pets" icon={<Pets />} />
                        <BottomNavigationAction label="Bookings" icon={<CalendarMonth />} />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper>
            </Box>
        </ThemeProvider>
    );
}

function SettingsItem({ icon, title, subtitle, hasSwitch, defaultChecked }: any) {
    return (
        <ListItem disablePadding>
            <ListItemButton>
                <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>{icon}</ListItemIcon>
                <ListItemText
                    primary={<Typography variant="body2" fontWeight="500">{title}</Typography>}
                    secondary={subtitle ? <Typography variant="caption" color="text.secondary">{subtitle}</Typography> : null}
                />
                <ListItemSecondaryAction>
                    {hasSwitch ? (
                        <Switch edge="end" color="primary" defaultChecked={defaultChecked} />
                    ) : (
                        <ChevronRight sx={{ color: 'text.secondary', fontSize: 20 }} />
                    )}
                </ListItemSecondaryAction>
            </ListItemButton>
        </ListItem>
    );
}

// Simple Chip component shim for the header
function Chip({ label, size, sx }: any) {
    return (
        <Box sx={{
            px: 1, py: 0.25, borderRadius: 1, fontSize: '0.7rem', display: 'inline-block', ...sx
        }}>
            {label}
        </Box>
    )
}
