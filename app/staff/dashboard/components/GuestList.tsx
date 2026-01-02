import { Box, Paper, Typography, Chip, Stack, IconButton, Divider, Tooltip } from "@mui/material";
import { Warning, Restaurant, SportsTennis, Medication, CrisisAlert, Assignment as AssignmentIcon, History, ExitToApp } from "@mui/icons-material";
import { motion } from "framer-motion";
import { GuestPet } from "@/types";

interface GuestListProps {
    guests: GuestPet[];
    loading: boolean;
    onToggleAction: (id: string, action: 'fed' | 'walked' | 'meds') => void;
    onLogIncident: (pet: GuestPet) => void;
    onPostReport: (pet: GuestPet) => void;
    onViewHistory: (pet: GuestPet) => void;
    onCheckOut: (pet: GuestPet) => void;
    onGuestClick: (pet: GuestPet) => void;
}

export default function GuestList({ guests, loading, onToggleAction, onLogIncident, onPostReport, onViewHistory, onCheckOut, onGuestClick }: GuestListProps) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(300px, 1fr))', // Auto-fill with min width prevents cramping
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
            },
            gap: 3
        }}>
            {loading ? (
                [1, 2, 3, 4].map(i => (
                    <Paper key={i} sx={{ height: 280, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))
            ) : guests.length === 0 ? (
                <Paper sx={{ gridColumn: '1 / -1', p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <Typography color="text.secondary">No guests currently checked in. Add pets via client accounts to see them here.</Typography>
                </Paper>
            ) : guests.map((guest) => (
                <motion.div key={guest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Paper
                        onClick={() => onGuestClick(guest)}
                        sx={{
                            overflow: 'hidden',
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }
                        }}>
                        {/* Card Content */}
                        <Box sx={{ position: 'relative', height: 160 }}>
                            <Box component="img" src={guest.img} alt={guest.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 60%)' }} />
                            <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                                <Typography variant="h5" fontWeight="bold" color="white">{guest.name}</Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{guest.breed}</Typography>
                            </Box>
                            <Chip label={guest.status} size="small" sx={{ position: 'absolute', top: 12, right: 12, bgcolor: guest.status === 'Active' ? '#22c55e' : '#f59e0b', color: 'white', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} />
                        </Box>
                        <Box sx={{ p: 2 }}>
                            {guest.alerts.length > 0 && (
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    {guest.alerts.map(alert => (
                                        <Chip key={alert} label={alert} size="small" icon={<Warning sx={{ fontSize: '14px !important' }} />} sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', border: '1px solid' }} />
                                    ))}
                                </Stack>
                            )}
                            <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 2 }}>
                                <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
                                    <Tooltip title="Breakfast/Dinner"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleAction(guest.id, 'fed'); }} sx={{ color: guest.fed ? '#22c55e' : 'text.disabled', bgcolor: guest.fed ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}><Restaurant fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Daily Playtime"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleAction(guest.id, 'walked'); }} sx={{ color: guest.walked ? '#3b82f6' : 'text.disabled', bgcolor: guest.walked ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}><SportsTennis fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Medication"><IconButton size="small" onClick={(e) => { e.stopPropagation(); guest.meds !== null && onToggleAction(guest.id, 'meds'); }} disabled={guest.meds === null} sx={{ color: guest.meds ? '#a855f7' : (guest.meds === null ? 'rgba(255,255,255,0.05)' : 'text.disabled'), bgcolor: guest.meds ? 'rgba(168, 85, 247, 0.1)' : 'transparent' }}><Medication fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Log Care Alert"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onLogIncident(guest); }} sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}><CrisisAlert fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="View History"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onViewHistory(guest); }} sx={{ color: 'text.secondary', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}><History fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Daily Update"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onPostReport(guest); }} sx={{ color: '#D4AF37', '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.1)' } }}><AssignmentIcon fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Check Out"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onCheckOut(guest); }} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}><ExitToApp fontSize="small" /></IconButton></Tooltip>
                                </Stack>
                            </Box>
                        </Box>
                    </Paper>
                </motion.div>
            ))}
        </Box>
    );
}
