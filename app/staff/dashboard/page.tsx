"use client";

import { Box, Typography, Grid, Paper, Chip, IconButton, Button, Stack, Container, Tooltip, Divider } from "@mui/material";
import {
    CheckCircle,
    Restaurant,
    DirectionsWalk,
    Medication,
    MoreVert,
    Warning,
    AccessTime,
    Add
} from "@mui/icons-material";
import { useState } from "react";
import { motion } from "framer-motion";

// Mock Data for "Daily Run"
const activeGuests = [
    { id: 1, name: "Rex", breed: "German Shepherd", status: "Active", alerts: [], fed: true, walked: true, meds: false, img: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Bella", breed: "Golden Retriever", status: "Active", alerts: ["Hip Dysplasia"], fed: true, walked: false, meds: true, img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "Luna", breed: "Husky", status: "Active", alerts: ["Escape Artist"], fed: false, walked: false, meds: false, img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80" },
    { id: 4, name: "Charlie", breed: "Beagle", status: "Active", alerts: [], fed: true, walked: true, meds: null, img: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=300&q=80" },
    { id: 5, name: "Max", breed: "Bulldog", status: "Check-in", alerts: ["Diet Restriction"], fed: false, walked: false, meds: false, img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80" },
    { id: 6, name: "Daisy", breed: "Poodle", status: "Check-out", alerts: [], fed: true, walked: true, meds: null, img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=300&q=80" },
];

export default function StaffDashboard() {
    const [guests, setGuests] = useState(activeGuests);

    const toggleAction = (id: number, action: 'fed' | 'walked' | 'meds') => {
        setGuests(guests.map(g => {
            if (g.id === id) {
                return { ...g, [action]: !g[action] };
            }
            return g;
        }));
    };

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="xl">

                {/* Header Actions */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={1}>
                            TUESDAY, DEC 30
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            Daily Run
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<Warning />}
                            sx={{ borderColor: 'rgba(234, 179, 8, 0.5)', color: '#eab308' }}
                        >
                            Log Incident
                        </Button>
                        <Button variant="contained" startIcon={<Add />}>
                            Quick Check-In
                        </Button>
                    </Stack>
                </Stack>

                {/* KPI Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
                    {[
                        { label: "Guests In House", value: "14", color: "primary.main" },
                        { label: "Check-Ins Today", value: "3", color: "text.primary" },
                        { label: "Departures", value: "5", color: "text.secondary" },
                        { label: "Pending Walks", value: "8", color: "#ef4444" },
                    ].map((kpi, i) => (
                        <Paper key={i} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: kpi.color }}>
                                {kpi.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                {kpi.label}
                            </Typography>
                        </Paper>
                    ))}
                </Box>

                {/* Guest Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
                    {guests.map((guest) => (
                        <motion.div key={guest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Paper sx={{
                                overflow: 'hidden',
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }
                            }}>
                                {/* Card Header & Image */}
                                <Box sx={{ position: 'relative', height: 160 }}>
                                    <Box
                                        component="img"
                                        src={guest.img}
                                        alt={guest.name}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 60%)'
                                    }} />

                                    <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                                        <Typography variant="h5" fontWeight="bold" color="white">{guest.name}</Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{guest.breed}</Typography>
                                    </Box>

                                    {/* Status Chip */}
                                    <Chip
                                        label={guest.status}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            bgcolor: guest.status === 'Active' ? '#22c55e' : '#f59e0b',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            backdropFilter: 'blur(4px)'
                                        }}
                                    />
                                </Box>

                                {/* Actions Body */}
                                <Box sx={{ p: 2 }}>
                                    {/* Alerts */}
                                    {guest.alerts.length > 0 && (
                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                            {guest.alerts.map(alert => (
                                                <Chip
                                                    key={alert}
                                                    label={alert}
                                                    size="small"
                                                    icon={<Warning sx={{ fontSize: '14px !important' }} />}
                                                    sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', border: '1px solid' }}
                                                />
                                            ))}
                                        </Stack>
                                    )}

                                    {/* Action Toggles */}
                                    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 2 }}>
                                        <Tooltip title="Breakfast/Dinner">
                                            <IconButton
                                                onClick={() => toggleAction(guest.id, 'fed')}
                                                sx={{
                                                    color: guest.fed ? '#22c55e' : 'text.disabled',
                                                    bgcolor: guest.fed ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                                                }}
                                            >
                                                <Restaurant fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                                        <Tooltip title="Daily Walk">
                                            <IconButton
                                                onClick={() => toggleAction(guest.id, 'walked')}
                                                sx={{
                                                    color: guest.walked ? '#3b82f6' : 'text.disabled',
                                                    bgcolor: guest.walked ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                                }}
                                            >
                                                <DirectionsWalk fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                                        <Tooltip title="Medication">
                                            <IconButton
                                                onClick={() => guest.meds !== null && toggleAction(guest.id, 'meds')}
                                                disabled={guest.meds === null}
                                                sx={{
                                                    color: guest.meds ? '#a855f7' : (guest.meds === null ? 'rgba(255,255,255,0.05)' : 'text.disabled'),
                                                    bgcolor: guest.meds ? 'rgba(168, 85, 247, 0.1)' : 'transparent'
                                                }}
                                            >
                                                <Medication fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                            </Paper>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
