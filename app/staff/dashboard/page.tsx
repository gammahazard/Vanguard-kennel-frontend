"use client";

import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Button,
    Stack,
    Container,
    Tooltip,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
    Switch
} from "@mui/material";
import {
    Restaurant,
    DirectionsWalk,
    Medication,
    Warning,
    Add,
    Store,
    Dashboard,
    TrendingUp,
    Security,
    People,
    PersonAdd,
    AttachMoney,
    Visibility,
    VisibilityOff,
    Settings,
    Face,
    CheckCircle,
    Cancel,
    Message,
    Assignment as AssignmentIcon
} from "@mui/icons-material";
import { startRegistration } from '@simplewebauthn/browser';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";

interface GuestPet {
    id: number;
    name: string;
    breed: string;
    status: 'Active' | 'Check-in' | 'Check-out';
    alerts: string[];
    fed: boolean;
    walked: boolean;
    meds: boolean | null;
    img: string;
}

const MOCK_FINANCIALS = {
    totalRevenue: "$124,500",
    growth: "+12%",
    occupancyRate: "92%",
    adr: "$840",
    chartData: [40, 65, 45, 80, 55, 90, 70],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
};

export default function StaffDashboard() {
    const [guests, setGuests] = useState<GuestPet[]>([]);
    const [loadingGuests, setLoadingGuests] = useState(true);
    const [viewMode, setViewMode] = useState<'operations' | 'business' | 'requests' | 'directory'>('operations');
    const [isOwner, setIsOwner] = useState(false);
    const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState({ text: "", severity: "info", open: false });

    // New States for Staff 2.0
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false);

    // Initial Face ID Check
    useEffect(() => {
        const email = localStorage.getItem('vanguard_email');
        if (email) {
            fetch(`${API_BASE_URL}/api/auth/check?email=${encodeURIComponent(email)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.faceid_registered) {
                        setIsFaceIdEnabled(true);
                        localStorage.setItem('vanguard_faceid_enabled', 'true');
                    } else {
                        setIsFaceIdEnabled(false);
                        localStorage.setItem('vanguard_faceid_enabled', 'false');
                    }
                })
                .catch(err => console.error("Face ID Status Check Failed", err));
        }
    }, [isOwner]);

    const handleFaceIdToggle = async () => {
        if (isFaceIdEnabled) {
            // Unregister Logic (Simplified for Owner)
            try {
                const email = localStorage.getItem('vanguard_email');
                if (!email) return;
                const res = await fetch(`${API_BASE_URL}/api/auth/webauthn/unregister?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
                if (res.ok) {
                    setIsFaceIdEnabled(false);
                    localStorage.setItem('vanguard_faceid_enabled', 'false');
                    setMessage({ text: "Face ID Disabled", severity: "info", open: true });
                }
            } catch (err) {
                setMessage({ text: "Failed to disable", severity: "error", open: true });
            }
        } else {
            // Register Logic
            setIsRegistering(true);
            try {
                const email = localStorage.getItem('vanguard_email');
                if (!email) {
                    setMessage({ text: "Session Error. Please re-login.", severity: "error", open: true });
                    return;
                }

                // 1. Start
                const resStart = await fetch(`${API_BASE_URL}/api/auth/webauthn/register/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                if (!resStart.ok) throw new Error("Registration Rejected");
                const options = await resStart.json();

                // 2. Prompt
                const authOptions = options.publicKey || options;
                const cleanOptions = { ...authOptions };
                if (cleanOptions.challenge_id) delete (cleanOptions as any).challenge_id;

                const attResp = await startRegistration(cleanOptions);

                // 3. Finish
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
                setMessage({ text: "Face ID Registration Failed", severity: "error", open: true });
            } finally {
                setIsRegistering(false);
            }
        }
    };

    // Staff Management State
    const [openAddStaff, setOpenAddStaff] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "", role: "staff" });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    useEffect(() => {
        const role = localStorage.getItem('vanguard_role');
        if (role === 'owner') {
            setIsOwner(true);
            fetchStaff();
        }
        // Always fetch pets for the Ops view
        fetchGuests();
        fetchPendingBookings();
        fetchClients();
    }, []);

    const fetchPendingBookings = async () => {
        setLoadingBookings(true);
        try {
            const token = localStorage.getItem('vanguard_token');
            const res = await fetch(`${API_BASE_URL}/api/admin/audit`, { // Hack: Using audit to see actions or we need a real bookings endpoint
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Actually we need real bookings. Let's try /api/bookings if the backend has it
            const resBookings = await fetch(`${API_BASE_URL}/api/user/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resBookings.ok) {
                const data = await resBookings.json();
                // Filter for pending if the backend supports it, otherwise mock for demo
                setPendingBookings(data.filter((b: any) => b.status === 'pending') || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBookings(false);
        }
    };

    const fetchClients = async () => {
        setLoadingClients(true);
        try {
            const token = localStorage.getItem('vanguard_token');
            const res = await fetch(`${API_BASE_URL}/api/staff/clients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingClients(false);
        }
    };

    const handleBookingAction = async (id: string, action: 'confirmed' | 'cancelled') => {
        try {
            const token = localStorage.getItem('vanguard_token');
            const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: action })
            });
            if (res.ok) {
                setMessage({ text: `Booking ${action} successfully!`, severity: "success", open: true });
                fetchPendingBookings();
                fetchGuests(); // Refresh guest list if they are checking in
            }
        } catch (e) {
            setMessage({ text: "Failed to update booking", severity: "error", open: true });
        }
    };

    const handleDeleteStaff = async (email: string) => {
        if (!confirm(`Are you sure you want to terminate ${email}?`)) return;
        try {
            const token = localStorage.getItem('vanguard_token');
            const res = await fetch(`${API_BASE_URL}/api/admin/staff/${encodeURIComponent(email)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMessage({ text: "Staff member removed", severity: "info", open: true });
                fetchStaff();
            }
        } catch (e) {
            setMessage({ text: "Failed to delete staff", severity: "error", open: true });
        }
    };

    const fetchGuests = async () => {
        setLoadingGuests(true);
        try {
            const token = localStorage.getItem('vanguard_token');
            const res = await fetch(`${API_BASE_URL}/api/pets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const pets = await res.json();
                // Map API response to GuestPet format
                const mapped: GuestPet[] = pets.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    breed: p.breed || 'Unknown',
                    status: 'Active' as const,
                    alerts: p.medical_info ? [p.medical_info] : [],
                    fed: false,
                    walked: false,
                    meds: p.medical_info ? false : null,
                    img: p.photo_url || `https://placedog.net/400/300?id=${p.id}`
                }));
                setGuests(mapped);
            }
        } catch (e) {
            console.error("Failed to fetch guests", e);
        } finally {
            setLoadingGuests(false);
        }
    };

    const fetchStaff = async () => {
        try {
            // Using existing clients list endpoint as a base or if get_staff_handler is distinct
            // For now, let's try fetching from /api/admin/staff if it exists, else user list
            const token = localStorage.getItem('vanguard_token');
            const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (e) {
            console.error("Failed to fetch staff", e);
        }
    };

    const handleAddStaff = async () => {
        setFormError("");
        setFormSuccess("");
        setLoadingStaff(true);

        try {
            const token = localStorage.getItem('vanguard_token');
            const url = `${API_BASE_URL}/api/users`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newStaff)
            });

            if (res.ok) {
                setFormSuccess("Employee added successfully!");
                setNewStaff({ name: "", email: "", password: "", role: "staff" });
                fetchStaff();
                setTimeout(() => setOpenAddStaff(false), 1500);
            } else {
                const text = await res.text();
                setFormError(`[${res.status}] ${text || "Failed to add employee"}`);
            }
        } catch (e: any) {
            setFormError(`Network error: ${e.message}`);
        } finally {
            setLoadingStaff(false);
        }
    };

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
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={3}
                    sx={{ mb: 4 }}
                >
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={1}>
                                {viewMode === 'operations' ? "TUESDAY, DEC 30" : "COMMAND CENTER"}
                            </Typography>
                            {isOwner && (
                                <Chip
                                    label="OWNER ACCESS"
                                    size="small"
                                    sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.6rem', height: 20 }}
                                />
                            )}
                        </Stack>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            {viewMode === 'operations' ? "Daily Run" : "Business Overview"}
                        </Typography>
                    </Box>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 0.5, borderRadius: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                            <Button
                                variant={viewMode === 'operations' ? 'contained' : 'text'}
                                onClick={() => setViewMode('operations')}
                                startIcon={<Store />}
                                sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'operations' ? 'black' : 'text.secondary', bgcolor: viewMode === 'operations' ? 'white' : 'transparent', '&:hover': { bgcolor: viewMode === 'operations' ? 'white' : 'rgba(255,255,255,0.05)' } }}
                            >
                                Ops
                            </Button>
                            <Button
                                variant={viewMode === 'requests' ? 'contained' : 'text'}
                                onClick={() => setViewMode('requests')}
                                startIcon={<AssignmentIcon />}
                                sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'requests' ? 'black' : 'text.secondary', bgcolor: viewMode === 'requests' ? '#3b82f6' : 'transparent', '&:hover': { bgcolor: viewMode === 'requests' ? '#3b82f6' : 'rgba(255,255,255,0.05)' } }}
                            >
                                Requests {pendingBookings.length > 0 && `(${pendingBookings.length})`}
                            </Button>
                            <Button
                                variant={viewMode === 'directory' ? 'contained' : 'text'}
                                onClick={() => setViewMode('directory')}
                                startIcon={<People />}
                                sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'directory' ? 'black' : 'text.secondary', bgcolor: viewMode === 'directory' ? 'white' : 'transparent', '&:hover': { bgcolor: viewMode === 'directory' ? 'white' : 'rgba(255,255,255,0.05)' } }}
                            >
                                Clients
                            </Button>
                            {isOwner && (
                                <Button
                                    variant={viewMode === 'business' ? 'contained' : 'text'}
                                    onClick={() => setViewMode('business')}
                                    startIcon={<Dashboard />}
                                    sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'business' ? 'black' : 'text.secondary', bgcolor: viewMode === 'business' ? '#D4AF37' : 'transparent', '&:hover': { bgcolor: viewMode === 'business' ? '#D4AF37' : 'rgba(255,255,255,0.05)' } }}
                                >
                                    Command
                                </Button>
                            )}
                            <IconButton onClick={() => setShowSettingsDialog(true)} sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'white' } }}>
                                <Settings />
                            </IconButton>
                        </Box>

                        {viewMode === 'operations' && (
                            <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                                <Button variant="outlined" color="warning" startIcon={<Warning />} sx={{ borderColor: 'rgba(234, 179, 8, 0.5)', color: '#eab308', flex: { xs: 1, sm: 'none' } }}>
                                    Incident
                                </Button>
                                <Button variant="contained" startIcon={<Add />} sx={{ flex: { xs: 1, sm: 'none' } }}>
                                    Check-In
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Stack>

                {/* --- OPERATIONS VIEW --- */}
                {viewMode === 'operations' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                            {loadingGuests ? (
                                [1, 2, 3, 4].map(i => (
                                    <Paper key={i} sx={{ height: 280, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                ))
                            ) : guests.length === 0 ? (
                                <Paper sx={{ gridColumn: '1 / -1', p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)' }}>
                                    <Typography color="text.secondary">No guests currently checked in. Add pets via client accounts to see them here.</Typography>
                                </Paper>
                            ) : guests.map((guest) => (
                                <motion.div key={guest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <Paper sx={{
                                        overflow: 'hidden',
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }
                                    }}>
                                        {/* Card Content (unchanged) */}
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
                                            <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 2 }}>
                                                <Tooltip title="Breakfast/Dinner"><IconButton onClick={() => toggleAction(guest.id, 'fed')} sx={{ color: guest.fed ? '#22c55e' : 'text.disabled', bgcolor: guest.fed ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}><Restaurant fontSize="small" /></IconButton></Tooltip>
                                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                                <Tooltip title="Daily Walk"><IconButton onClick={() => toggleAction(guest.id, 'walked')} sx={{ color: guest.walked ? '#3b82f6' : 'text.disabled', bgcolor: guest.walked ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}><DirectionsWalk fontSize="small" /></IconButton></Tooltip>
                                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                                <Tooltip title="Medication"><IconButton onClick={() => guest.meds !== null && toggleAction(guest.id, 'meds')} disabled={guest.meds === null} sx={{ color: guest.meds ? '#a855f7' : (guest.meds === null ? 'rgba(255,255,255,0.05)' : 'text.disabled'), bgcolor: guest.meds ? 'rgba(168, 85, 247, 0.1)' : 'transparent' }}><Medication fontSize="small" /></IconButton></Tooltip>
                                            </Stack>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            ))}
                        </Box>
                    </motion.div>
                )}

                {/* --- BUSINESS OVERVIEW (COMMAND CENTER) --- */}
                {viewMode === 'business' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Stack spacing={3}>

                            {/* Left Column: Revenue & Stats */}
                            <Stack spacing={3}>
                                {/* Revenue Graphic (CSS Mock) */}
                                <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(212, 175, 55, 0.2)', position: 'relative', overflow: 'hidden' }}>
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, #D4AF37, #F5D061)' }} />
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
                                        <Box>
                                            <Typography variant="overline" color="text.secondary">Total Revenue (Dec)</Typography>
                                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#D4AF37' }}>{MOCK_FINANCIALS.totalRevenue}</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                                                <TrendingUp sx={{ color: '#22c55e', fontSize: 18 }} />
                                                <Typography variant="body2" sx={{ color: '#22c55e' }}>{MOCK_FINANCIALS.growth} vs last month</Typography>
                                            </Stack>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }}>Download Report</Button>
                                        </Box>
                                    </Stack>

                                    {/* Bar Chart Visualization */}
                                    <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ height: 200, px: 2 }}>
                                        {MOCK_FINANCIALS.chartData.map((h, i) => (
                                            <Box key={i} sx={{ width: '8%', height: `${h}%`, bgcolor: i === 5 ? '#D4AF37' : 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease', position: 'relative', '&:hover': { bgcolor: i === 5 ? '#F5D061' : 'rgba(255,255,255,0.1)' } }}>
                                                {i === 5 && <Box sx={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', bgcolor: '#D4AF37', color: 'black', fontSize: 10, px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold' }}>Record</Box>}
                                            </Box>
                                        ))}
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, px: 2 }}>
                                        {MOCK_FINANCIALS.days.map(d => (
                                            <Typography key={d} variant="caption" color="text.secondary">{d}</Typography>
                                        ))}
                                    </Stack>
                                </Paper>

                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                    <Paper sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                            <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><People /></Avatar>
                                            <Box>
                                                <Typography variant="h5" fontWeight="bold">{MOCK_FINANCIALS.occupancyRate}</Typography>
                                                <Typography variant="caption" color="text.secondary">Occupancy Rate</Typography>
                                            </Box>
                                        </Stack>
                                        <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                            <Box sx={{ width: '92%', height: '100%', bgcolor: '#3b82f6', borderRadius: 2 }} />
                                        </Box>
                                    </Paper>
                                    <Paper sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                            <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><AttachMoney /></Avatar>
                                            <Box>
                                                <Typography variant="h5" fontWeight="bold">{MOCK_FINANCIALS.adr}</Typography>
                                                <Typography variant="caption" color="text.secondary">Avg. Daily Rate</Typography>
                                            </Box>
                                        </Stack>
                                        <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                            <Box sx={{ width: '65%', height: '100%', bgcolor: '#10b981', borderRadius: 2 }} />
                                        </Box>
                                    </Paper>
                                </Stack>
                            </Stack>

                            {/* Right Column: Staff Management */}
                            <Stack spacing={3}>
                                <Paper sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Security sx={{ color: 'text.secondary' }} />
                                            <Typography variant="h6" fontWeight="bold">My Team</Typography>
                                        </Stack>
                                        <Button startIcon={<PersonAdd />} size="small" variant="contained" onClick={() => setOpenAddStaff(true)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                            Add Staff
                                        </Button>
                                    </Stack>

                                    <Stack spacing={2}>
                                        {staffList.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" textAlign="center">No staff found.</Typography>
                                        ) : (
                                            staffList.map((staff, i) => (
                                                <Stack key={i} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: staff.role === 'owner' ? '#F59E0B' : '#3B82F6', fontSize: 12, fontWeight: 'bold' }}>{staff.name[0]}</Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">{staff.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{staff.role}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Chip label="Active" size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }} />
                                                        {isOwner && staff.role !== 'owner' && (
                                                            <IconButton size="small" color="error" onClick={() => handleDeleteStaff(staff.email)}>
                                                                <Cancel sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                </Stack>
                                            ))
                                        )}
                                    </Stack>
                                </Paper>

                                <Paper
                                    onClick={() => window.location.href = '/staff/audit'}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        bgcolor: 'rgba(239, 68, 68, 0.05)',
                                        border: '1px solid rgba(239, 68, 68, 0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', transform: 'translateY(-2px)' }
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Warning color="error" />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" color="error">System Alert</Typography>
                                            <Typography variant="caption" color="text.secondary">3 failed login attempts blocked from IP 192.168.1.45</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                {/* Global Comms Shortcut */}
                                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                        <Message sx={{ color: 'text.secondary' }} />
                                        <Typography variant="h6" fontWeight="bold">Global Comms</Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        View, filter, and audit all client-staff communication logs.
                                    </Typography>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => window.location.href = '/staff/comms'}
                                        sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.primary', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
                                    >
                                        Open Black Box
                                    </Button>
                                </Paper>
                            </Stack>
                        </Stack>
                    </motion.div>
                )}

                {/* --- BOOKING REQUESTS VIEW --- */}
                {viewMode === 'requests' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'white' }}>Pending Booking Requests</Typography>
                        <Stack spacing={2}>
                            {loadingBookings ? (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <CircularProgress size={32} sx={{ color: '#3b82f6' }} />
                                </Box>
                            ) : pendingBookings.length === 0 ? (
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <Typography color="#64748b">No pending requests at this time.</Typography>
                                </Paper>
                            ) : pendingBookings.map((booking) => (
                                <Paper key={booking.id} sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><AssignmentIcon /></Avatar>
                                            <Box>
                                                <Typography fontWeight="bold" color="white">{booking.dog_name || "Unknown Pet"}</Typography>
                                                <Typography variant="caption" color="#94a3b8">Owner: {booking.owner_email}</Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5, color: '#e2e8f0' }}>Service: {booking.service_type} | Date: {new Date(booking.start_date).toLocaleDateString()}</Typography>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            <Button variant="outlined" color="error" size="small" onClick={() => handleBookingAction(booking.id, 'cancelled')}>Decline</Button>
                                            <Button variant="contained" color="success" size="small" onClick={() => handleBookingAction(booking.id, 'confirmed')}>Accept</Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </motion.div>
                )}

                {/* --- CLIENT DIRECTORY VIEW --- */}
                {viewMode === 'directory' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'white' }}>Client & Pet Directory</Typography>
                        <Stack spacing={2}>
                            {loadingClients ? (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <CircularProgress size={32} sx={{ color: '#D4AF37' }} />
                                </Box>
                            ) : clients.length === 0 ? (
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <Typography color="#64748b">No clients or pets found.</Typography>
                                </Paper>
                            ) : clients.map((client, idx) => (
                                <Paper key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={client.pets?.[0]?.photo_url} sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}>{client.email[0].toUpperCase()}</Avatar>
                                            <Box>
                                                <Typography fontWeight="bold" color="white">{client.email}</Typography>
                                                <Typography variant="caption" color="#94a3b8">Pets: {client.pets?.map((p: any) => p.name).join(', ') || 'No pets registered'}</Typography>
                                            </Box>
                                        </Stack>
                                        <Button size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>View Stats</Button>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </motion.div>
                )}

            </Container>

            {/* Add Staff Modal */}
            <Dialog open={openAddStaff} onClose={() => setOpenAddStaff(false)} PaperProps={{ sx: { bgcolor: '#1e293b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ color: 'white' }}>Add New Team Member</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1, minWidth: 300 }}>
                        {formError && <Alert severity="error">{formError}</Alert>}
                        {formSuccess && <Alert severity="success">{formSuccess}</Alert>}

                        <TextField
                            label="Full Name"
                            fullWidth
                            value={newStaff.name}
                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        />
                        <TextField
                            label="Email Address"
                            fullWidth
                            value={newStaff.email}
                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={newStaff.role}
                                label="Role"
                                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                            >
                                <MenuItem value="staff">Staff (Operational)</MenuItem>
                                <MenuItem value="owner">Owner (Admin Access)</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            value={newStaff.password}
                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAddStaff(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddStaff}
                        disabled={loadingStaff}
                        sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                    >
                        {loadingStaff ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Owner Settings Modal */}
            <Dialog
                open={showSettingsDialog}
                onClose={() => setShowSettingsDialog(false)}
                PaperProps={{ sx: { bgcolor: '#1e293b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, minWidth: 350 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                    <Settings /> Command Settings
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Face sx={{ color: isFaceIdEnabled ? '#22c55e' : 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold" color="white">Face ID Access</Typography>
                                        <Typography variant="caption" color="text.secondary">Use biometrics for quick login</Typography>
                                    </Box>
                                </Stack>
                                <Switch
                                    checked={isFaceIdEnabled}
                                    onChange={handleFaceIdToggle}
                                    disabled={isRegistering}
                                    color="success"
                                />
                            </Stack>
                        </Paper>

                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={() => {
                                localStorage.removeItem('vanguard_token');
                                window.location.href = '/';
                            }}
                        >
                            Emergency Sign Out
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowSettingsDialog(false)} sx={{ color: 'text.secondary' }}>Close</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
