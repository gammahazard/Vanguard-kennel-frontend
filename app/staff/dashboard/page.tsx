"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import {
    Box,
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Chip,
    Stack,
    ThemeProvider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    CircularProgress,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    BottomNavigation,
    BottomNavigationAction,
    CssBaseline,
    Avatar
} from "@mui/material";
import {
    Security,
    Person,
    Logout,
    TrendingUp,
    AttachMoney,
    Pets,
    Badge as BadgeIcon,
    Delete,
    Add,
    Home,
    BarChart,
    People,
    Settings,
    EventAvailable,
    EventBusy,
    CheckCircle,
    Schedule
} from "@mui/icons-material";
import { theme } from "@/lib/theme";

interface AuditLog {
    id: number;
    user_email: string;
    action: string;
    timestamp: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface MonthlyRevenue {
    month: string;
    amount: number;
}

interface BookingCounts {
    confirmed: number;
    cancelled: number;
    pending: number;
    completed: number;
}

interface DashboardStats {
    revenue: number;
    occupancy: number;
    active_guests: number;
    staff_count: number;
    monthly_revenue: MonthlyRevenue[];
    booking_counts: BookingCounts;
}

export default function OwnerDashboard() {
    const router = useRouter();
    const [name, setName] = useState("Owner");
    // Nav: 0=Overview, 1=Staff, 2=Logs
    const [navValue, setNavValue] = useState(0);

    // Data States
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [staffList, setStaffList] = useState<User[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Modal States
    const [openStaffModal, setOpenStaffModal] = useState(false);
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffPassword, setNewStaffPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem('vanguard_role');
        const storedName = localStorage.getItem('vanguard_user');

        if (storedRole !== 'owner') {
            router.push('/login'); // Only owners allowed here for now (Staff have different view planned)
            return;
        }

        setName(storedName || "Owner");
        fetchStats();
        fetchStaff();
        fetchLogs();
    }, [router]);

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/audit`);
            if (res.ok) setAuditLogs(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/staff`);
            if (res.ok) setStaffList(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/stats`);
            if (res.ok) setStats(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleCreateStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newStaffEmail,
                    name: newStaffName,
                    password: newStaffPassword
                })
            });

            if (res.ok) {
                setOpenStaffModal(false);
                setNewStaffEmail("");
                setNewStaffName("");
                setNewStaffPassword("");
                fetchStaff();
                fetchStats();
            } else {
                alert("Failed. Ensure email ends with @vanguard.com");
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleTerminateStaff = async (email: string) => {
        if (!confirm(`Permanently remove ${email}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/staff/${email}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStaff();
                fetchStats();
            }
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/staff/login');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>

                {/* --- TOP BAR --- */}
                <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', color: 'black', fontWeight: 'bold' }}>
                            {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="primary" sx={{ letterSpacing: '0.1em', fontWeight: 'bold' }}>COMMAND CENTER</Typography>
                            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>{name}</Typography>
                        </Box>
                    </Stack>
                    <IconButton size="small" onClick={handleLogout} sx={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Logout fontSize="small" />
                    </IconButton>
                </Paper>

                <Container maxWidth="md" sx={{ pt: 3 }}>

                    {/* VIEW 0: OVERVIEW (Stats & Graphs) */}
                    {navValue === 0 && stats && (
                        <Stack spacing={3}>
                            {/* Key Metrics Grid */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <MetricCard
                                    label="Revenue"
                                    value={`$${stats.revenue.toLocaleString()}`}
                                    icon={<AttachMoney color="success" />}
                                    trend="+12%"
                                />
                                <MetricCard
                                    label="Occupancy"
                                    value={`${stats.occupancy}/50`}
                                    icon={<TrendingUp color="primary" />}
                                    trend="Normal"
                                />
                                <MetricCard
                                    label="Active Guests"
                                    value={stats.active_guests.toString()}
                                    icon={<Pets color="secondary" />}
                                />
                                <MetricCard
                                    label="Staff On Duty"
                                    value={stats.staff_count.toString()}
                                    icon={<BadgeIcon color="info" />}
                                />
                            </Box>

                            {/* Revenue Graph */}
                            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography variant="h6" sx={{ mb: 3 }}>Revenue Trend</Typography>
                                <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
                                    {stats.monthly_revenue && stats.monthly_revenue.length > 0 ? stats.monthly_revenue.map((m, i) => (
                                        <Stack key={i} alignItems="center" spacing={1} sx={{ flex: 1 }}>
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: `${Math.max((m.amount / 5000) * 100, 10)}%`, // Mock scale factor
                                                    maxHeight: '100%',
                                                    bgcolor: i === stats.monthly_revenue.length - 1 ? 'primary.main' : 'rgba(255,255,255,0.1)',
                                                    borderRadius: 1,
                                                    transition: 'all 0.5s'
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary">{m.month?.split('-')[1] || m.month}</Typography>
                                        </Stack>
                                    )) : (
                                        <Typography color="text.secondary">No revenue data available yet.</Typography>
                                    )}
                                </Box>
                            </Paper>

                            {/* Booking Status Breakdown */}
                            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Booking Status</Typography>
                                <Stack spacing={2}>
                                    <StatusRow label="Confirmed" count={stats.booking_counts?.confirmed || 0} total={100} color="#4ade80" icon={<CheckCircle sx={{ fontSize: 16 }} />} />
                                    <StatusRow label="Pending" count={stats.booking_counts?.pending || 0} total={100} color="#facc15" icon={<Schedule sx={{ fontSize: 16 }} />} />
                                    <StatusRow label="Completed" count={stats.booking_counts?.completed || 0} total={100} color="#60a5fa" icon={<EventAvailable sx={{ fontSize: 16 }} />} />
                                    <StatusRow label="Cancelled" count={stats.booking_counts?.cancelled || 0} total={100} color="#f87171" icon={<EventBusy sx={{ fontSize: 16 }} />} />
                                </Stack>
                            </Paper>
                        </Stack>
                    )}

                    {/* VIEW 1: STAFF MANAGEMENT */}
                    {navValue === 1 && (
                        <Stack spacing={3}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h5" fontWeight="bold">Team Vanguard</Typography>
                                <Button startIcon={<Add />} variant="contained" size="small" onClick={() => setOpenStaffModal(true)}>
                                    Hire Staff
                                </Button>
                            </Stack>

                            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'gray' }}>Staff Member</TableCell>
                                            <TableCell align="right" sx={{ color: 'gray' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {staffList.map((staff) => (
                                            <TableRow key={staff.email}>
                                                <TableCell>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{staff.name.charAt(0)}</Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">{staff.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{staff.email}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="error" size="small" onClick={() => handleTerminateStaff(staff.email)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Stack>
                    )}

                    {/* VIEW 2: SECURITY LOGS */}
                    {navValue === 2 && (
                        <Stack spacing={3}>
                            <Typography variant="h5" fontWeight="bold">Security Audit</Typography>
                            <Paper sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden' }}>
                                <List>
                                    {auditLogs.map((log) => (
                                        <ListItem key={log.id} divider>
                                            <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                                <Security color={log.action.includes('FAILURE') ? 'error' : 'primary'} />
                                                <ListItemText
                                                    primary={log.action.replace(/_/g, " ")}
                                                    secondary={`${log.user_email} • ${new Date(log.timestamp).toLocaleTimeString()}`}
                                                    primaryTypographyProps={{ fontWeight: 500 }}
                                                />
                                            </Stack>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Stack>
                    )}
                </Container>

                {/* --- BOTTOM NAVIGATION --- */}
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.05)' }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={navValue}
                        onChange={(e, v) => setNavValue(v)}
                        sx={{ bgcolor: '#0B0C10', height: 70, '& .Mui-selected': { color: 'primary.main' } }}
                    >
                        <BottomNavigationAction label="Overview" icon={<BarChart />} />
                        <BottomNavigationAction label="Staff" icon={<People />} />
                        <BottomNavigationAction label="Security" icon={<Security />} />
                    </BottomNavigation>
                </Paper>

                {/* HIRE STAFF MODAL */}
                <Dialog open={openStaffModal} onClose={() => setOpenStaffModal(false)} PaperProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 3 } }}>
                    <DialogTitle>Hire New Staff</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                            <TextField
                                label="Full Name" fullWidth variant="filled"
                                value={newStaffName} onChange={e => setNewStaffName(e.target.value)}
                            />
                            <TextField
                                label="Email (@vanguard.com)" fullWidth variant="filled"
                                value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)}
                            />
                            <TextField
                                label="Password" type="password" fullWidth variant="filled"
                                value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenStaffModal(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleCreateStaff} disabled={loading}>
                            {loading ? <CircularProgress size={20} /> : "Hire"}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </ThemeProvider>
    );
}

// --- SUB-COMPONENTS ---

function MetricCard({ label, value, icon, trend }: any) {
    return (
        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    {icon}
                </Stack>
                <Typography variant="h5" fontWeight="bold">{value}</Typography>
                {trend && <Typography variant="caption" color={trend.includes('+') ? 'success.main' : 'text.secondary'}>{trend} vs last month</Typography>}
            </Stack>
        </Paper>
    );
}

function StatusRow({ label, count, total, color, icon }: any) {
    const pct = (count / (total || 1)) * 100; // Mock total for now or use real total
    return (
        <Stack spacing={0.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                    {icon}
                    <Typography variant="body2">{label}</Typography>
                </Stack>
                <Typography variant="body2" fontWeight="bold">{count}</Typography>
            </Stack>
            <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
                <Box sx={{ width: `${Math.min(count * 5, 100)}%`, height: '100%', bgcolor: color }} />
            </Box>
        </Stack>
    );
}
