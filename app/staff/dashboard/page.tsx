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
    InputAdornment
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
    VisibilityOff
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";

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
    const [viewMode, setViewMode] = useState<'operations' | 'business'>('operations');
    const [isOwner, setIsOwner] = useState(false);

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
    }, []);

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
            const res = await fetch(`${API_BASE_URL}/api/users`, {
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
                setFormError(text || "Failed to add employee");
            }
        } catch (e) {
            setFormError("Network error");
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
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
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

                    <Stack direction="row" spacing={2}>
                        {isOwner && (
                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 0.5, borderRadius: 3, display: 'flex' }}>
                                <Button
                                    variant={viewMode === 'operations' ? 'contained' : 'text'}
                                    onClick={() => setViewMode('operations')}
                                    startIcon={<Store />}
                                    sx={{ borderRadius: 2.5, px: 3, color: viewMode === 'operations' ? 'black' : 'text.secondary', bgcolor: viewMode === 'operations' ? 'white' : 'transparent', '&:hover': { bgcolor: viewMode === 'operations' ? 'white' : 'rgba(255,255,255,0.05)' } }}
                                >
                                    Ops
                                </Button>
                                <Button
                                    variant={viewMode === 'business' ? 'contained' : 'text'}
                                    onClick={() => setViewMode('business')}
                                    startIcon={<Dashboard />}
                                    sx={{ borderRadius: 2.5, px: 3, color: viewMode === 'business' ? 'black' : 'text.secondary', bgcolor: viewMode === 'business' ? '#D4AF37' : 'transparent', '&:hover': { bgcolor: viewMode === 'business' ? '#D4AF37' : 'rgba(255,255,255,0.05)' } }}
                                >
                                    Command
                                </Button>
                            </Box>
                        )}

                        {viewMode === 'operations' && (
                            <>
                                <Button variant="outlined" color="warning" startIcon={<Warning />} sx={{ borderColor: 'rgba(234, 179, 8, 0.5)', color: '#eab308' }}>
                                    Log Incident
                                </Button>
                                <Button variant="contained" startIcon={<Add />}>
                                    Quick Check-In
                                </Button>
                            </>
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
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>

                            {/* Left Column: Revenue & Stats */}
                            <Stack spacing={3}>
                                {/* Revenue Graphic (CSS Mock) */}
                                <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(212, 175, 55, 0.2)', position: 'relative', overflow: 'hidden' }}>
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, #D4AF37, #F5D061)' }} />
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
                                        <Box>
                                            <Typography variant="overline" color="text.secondary">Total Revenue (Dec)</Typography>
                                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#D4AF37' }}>$124,500</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                                                <TrendingUp sx={{ color: '#22c55e', fontSize: 18 }} />
                                                <Typography variant="body2" sx={{ color: '#22c55e' }}>+12% vs last month</Typography>
                                            </Stack>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }}>Download Report</Button>
                                        </Box>
                                    </Stack>

                                    {/* Bar Chart Visualization */}
                                    <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ height: 200, px: 2 }}>
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <Box key={i} sx={{ width: '8%', height: `${h}%`, bgcolor: i === 5 ? '#D4AF37' : 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease', position: 'relative', '&:hover': { bgcolor: i === 5 ? '#F5D061' : 'rgba(255,255,255,0.1)' } }}>
                                                {i === 5 && <Box sx={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', bgcolor: '#D4AF37', color: 'black', fontSize: 10, px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold' }}>Record</Box>}
                                            </Box>
                                        ))}
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, px: 2 }}>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                            <Typography key={d} variant="caption" color="text.secondary">{d}</Typography>
                                        ))}
                                    </Stack>
                                </Paper>

                                <Stack direction="row" spacing={3}>
                                    <Paper sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                            <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><People /></Avatar>
                                            <Box>
                                                <Typography variant="h5" fontWeight="bold">92%</Typography>
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
                                                <Typography variant="h5" fontWeight="bold">$840</Typography>
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
                                                    <Chip label="Active" size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }} />
                                                </Stack>
                                            ))
                                        )}
                                    </Stack>
                                </Paper>

                                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Warning color="error" />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" color="error">System Alert</Typography>
                                            <Typography variant="caption" color="text.secondary">3 failed login attempts blocked from IP 192.168.1.45</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Box>
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

        </Box>
    );
}
