"use client";

import { useState } from "react";
import {
    Box, Typography, Container, Stack, Paper, Avatar,
    BottomNavigation, BottomNavigationAction, ThemeProvider, CssBaseline
} from "@mui/material";
import { Home, Pets, CalendarMonth, Person, MoreVert } from "@mui/icons-material";
import { theme } from "@/lib/theme";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PetsView() {
    const router = useRouter();
    const [navValue, setNavValue] = useState(1); // Index 1 is Pets

    const handleNavChange = (newValue: number) => {
        setNavValue(newValue);
        if (newValue === 0) router.push('/client/dashboard');
        if (newValue === 2) router.push('/client/bookings');
        if (newValue === 3) router.push('/client/profile');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>

                {/* Header */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <Typography variant="h6" fontWeight="bold">My Pets</Typography>
                </Paper>

                <Container maxWidth="sm" sx={{ pt: 2 }}>
                    <Stack spacing={2}>
                        {/* Pet Card 1 */}
                        <PetCard
                            name="Winston"
                            breed="Golden Retriever"
                            status="Checked In"
                            statusColor="#4ade80"
                            img="/dog-1.jpg" // Placeholder logic
                        />
                        {/* Pet Card 2 */}
                        <PetCard
                            name="Luna"
                            breed="French Bulldog"
                            status="At Home"
                            statusColor="text.secondary"
                            img="/dog-2.jpg"
                        />
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

function PetCard({ name, breed, status, statusColor, img }: any) {
    return (
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>{name[0]}</Avatar>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">{name}</Typography>
                <Typography variant="body2" color="text.secondary">{breed}</Typography>
                <Typography variant="caption" sx={{ color: statusColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    • {status}
                </Typography>
            </Box>
            <MoreVert sx={{ color: 'text.secondary' }} />
        </Paper>
    );
}
