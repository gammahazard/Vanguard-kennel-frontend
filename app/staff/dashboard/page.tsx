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
    Avatar,
    ToggleButton,
    ToggleButtonGroup,
    Switch,
    Snackbar,
    Alert,
    Badge,
    InputAdornment,
    Grid
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
    Schedule,
    Chat,
    Face,
    Warning
} from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { startRegistration } from '@simplewebauthn/browser';

interface AuditLog {
    id: number;
    user_email: string;
    action: string;
    timestamp: string;
    user_role?: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface Message {
    id: string;
    sender_email: string;
    receiver_email: string;
    content: string;
    timestamp: string;
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
    // Nav: 0=Overview, 1=Staff, 2=Messages, 3=Security
    const [navValue, setNavValue] = useState(0);

    // Data States
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [staffList, setStaffList] = useState<User[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [allMessages, setAllMessages] = useState<Message[]>([]);

    // UI States
    const [logFilter, setLogFilter] = useState("all");
    const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [feedback, setFeedback] = useState({ text: "", severity: "info" as "info" | "success" | "error", open: false });

    // Simulator State
    const [overhead, setOverhead] = useState(2500);
    const [staffRate, setStaffRate] = useState(3200);

    // Modal States
    const [openStaffModal, setOpenStaffModal] = useState(false);
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffPassword, setNewStaffPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem('vanguard_role');
        const storedName = localStorage.getItem('vanguard_user');
        const email = localStorage.getItem('vanguard_email');

        if (storedRole !== 'owner') {
            router.push('/login');
            return;
        }

        setName(storedName || "Owner");
        fetchStats();
        fetchStaff();
        fetchLogs();
        fetchMessages();
        checkFaceIdStatus(email);
    }, [router]);

    const checkFaceIdStatus = async (email: string | null) => {
        if (!email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/check?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setIsFaceIdEnabled(data.faceid_registered);
            }
        } catch (err) { console.error(err); }
    };

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

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
            if (res.ok) setAllMessages(await res.json());
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
                setFeedback({ text: "Staff member hired successfully!", severity: "success", open: true });
            } else {
                setFeedback({ text: "Failed to hire staff. Ensure email ends with @vanguard.com", severity: "error", open: true });
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
                setFeedback({ text: "Staff access revoked.", severity: "info", open: true });
            }
        } catch (err) { console.error(err); }
    };

    const handleFaceIdToggle = async () => {
        if (isFaceIdEnabled) {
            // Unregister logic
            try {
                const email = localStorage.getItem('vanguard_email');
                const res = await fetch(`${API_BASE_URL}/api/auth/webauthn/unregister?email=${encodeURIComponent(email || "")}`, { method: 'DELETE' });
                if (res.ok) {
                    setIsFaceIdEnabled(false);
                    setFeedback({ text: "Face ID disabled.", severity: "info", open: true });
                }
            } catch (err) { console.error(err); }
            return;
        }

        setIsRegistering(true);
        try {
            const email = localStorage.getItem('vanguard_email');
            const resStart = await fetch(`${API_BASE_URL}/api/auth/webauthn/register/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const options = await resStart.json();
            const attResp = await startRegistration(options.publicKey || options);

            const resFinish = await fetch(`${API_BASE_URL}/api/auth/webauthn/register/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge_id: options.challenge_id, response: attResp })
            });

            if (resFinish.ok) {
                setIsFaceIdEnabled(true);
                setFeedback({ text: "Face ID enabled for Command Center!", severity: "success", open: true });
            }
        } catch (err: any) {
            setFeedback({ text: err.message || "Face ID setup failed.", severity: "error", open: true });
        } finally {
            setIsRegistering(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/');
    };

    // Group messages by conversation (unique pair of emails)
    const groupedMessages: Record<string, Message[]> = allMessages.reduce((acc, msg) => {
        const key = [msg.sender_email, msg.receiver_email].sort().join("<>");
        if (!acc[key]) acc[key] = [];
        acc[key].push(msg);
        return acc;
    }, {} as Record<string, Message[]>);

    const filteredLogs = auditLogs.filter(log => {
        if (logFilter === "all") return true;
        if (logFilter === "staff") return log.user_role === "staff" || log.user_role === "owner";
        if (logFilter === "clients") return log.user_role === "client";
        return true;
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 12 }}>

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
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <MetricCard label="Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={<AttachMoney color="success" />} trend="+12%" />
                                <MetricCard label="Occupancy" value={`${stats.occupancy}/50`} icon={<TrendingUp color="primary" />} trend="Normal" />
                                <MetricCard label="Active Guests" value={stats.active_guests.toString()} icon={<Pets color="secondary" />} />
                                <MetricCard label="Staff On Duty" value={stats.staff_count.toString()} icon={<BadgeIcon color="info" />} />
                            </Box>

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
                                                    bgcolor: i === stats.monthly_revenue.length - 1 ? 'primary.main' : 'rgba(255,255,255,0.3)',
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

                            {/* Profit/Loss Simulator */}
                            <Paper sx={{ p: 3, bgcolor: 'rgba(212, 175, 55, 0.05)', borderRadius: 4, border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <BarChart color="primary" />
                                    <Typography variant="h6" fontWeight="bold">Operational Simulator</Typography>
                                </Stack>

                                <Grid container spacing={3}>
                                    <Grid sx={{ gridColumn: 'span 12', gridColumnMd: 'span 6' }} style={{ display: 'block', gridColumn: 'span 12' }}>
                                        {/* Using span directly for maximal compatibility if xs fails */}
                                        <Box sx={{ width: '100%' }}>
                                            <Typography variant="caption" color="text.secondary" gutterBottom display="block">EST. MONTHLY PROFIT</Typography>
                                            <Typography variant="h4" fontWeight="bold" sx={{ color: (stats.revenue - overhead - (stats.staff_count * staffRate)) > 0 ? 'success.main' : 'error.main' }}>
                                                ${(stats.revenue - overhead - (stats.staff_count * staffRate)).toLocaleString()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Real-time projection</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid sx={{ gridColumn: 'span 12', gridColumnMd: 'span 6' }}>
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Monthly Overhead ($)</Typography>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={overhead}
                                                    onChange={(e) => setOverhead(Number(e.target.value))}
                                                    fullWidth
                                                    variant="standard"
                                                    sx={{ input: { color: '#fff' } }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="flex" justifyContent="space-between">
                                                    <span>Salary per Staff ($)</span>
                                                    <span style={{ opacity: 0.5 }}>{stats.staff_count} active staff</span>
                                                </Typography>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={staffRate}
                                                    onChange={(e) => setStaffRate(Number(e.target.value))}
                                                    fullWidth
                                                    variant="standard"
                                                    sx={{ input: { color: '#fff' } }}
                                                />
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>

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
                                <Button startIcon={<Add />} variant="contained" size="small" onClick={() => setOpenStaffModal(true)}>Hire Staff</Button>
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
                                                    <IconButton color="error" size="small" onClick={() => handleTerminateStaff(staff.email)}><Delete fontSize="small" /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Stack>
                    )}

                    {/* VIEW 2: GLOBAL MESSAGES */}
                    {navValue === 2 && (
                        <Stack spacing={3}>
                            <Typography variant="h5" fontWeight="bold">Comms Master View</Typography>
                            {Object.keys(groupedMessages).length > 0 ? (
                                <Stack spacing={2}>
                                    {Object.entries(groupedMessages).map(([key, msgs]) => {
                                        const lastMsg = msgs[0];
                                        return (
                                            <Paper key={key} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Stack spacing={1}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                            {lastMsg.sender_email} ↔ {lastMsg.receiver_email}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(lastMsg.timestamp).toLocaleDateString()}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                                        &quot;{lastMsg.content.substring(0, 100)}{lastMsg.content.length > 100 ? '...' : ''}&quot;
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ textAlign: 'right', display: 'block' }}>
                                                        {msgs.length} messages in thread
                                                    </Typography>
                                                </Stack>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">No communications logged yet.</Typography>
                                </Box>
                            )}
                        </Stack>
                    )}

                    {/* VIEW 3: SECURITY & SETTINGS */}
                    {navValue === 3 && (
                        <Stack spacing={3}>
                            <Typography variant="h5" fontWeight="bold">Security Center</Typography>

                            {/* Owner Face ID */}
                            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'secondary.main' }}><Face /></Avatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">Owner Face ID</Typography>
                                            <Typography variant="caption" color="text.secondary">Unlock Command Center with biometrics</Typography>
                                        </Box>
                                    </Stack>
                                    <Switch checked={isFaceIdEnabled} onChange={handleFaceIdToggle} disabled={isRegistering} />
                                </Stack>
                            </Paper>

                            {/* Audit Filter */}
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">Audit Logs</Typography>
                                    <ToggleButtonGroup
                                        size="small"
                                        value={logFilter}
                                        exclusive
                                        onChange={(e, v) => v && setLogFilter(v)}
                                        sx={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                        <ToggleButton value="all" sx={{ px: 2, py: 0.5, fontSize: '0.7rem' }}>All</ToggleButton>
                                        <ToggleButton value="staff" sx={{ px: 2, py: 0.5, fontSize: '0.7rem' }}>Staff</ToggleButton>
                                        <ToggleButton value="clients" sx={{ px: 2, py: 0.5, fontSize: '0.7rem' }}>Clients</ToggleButton>
                                    </ToggleButtonGroup>
                                </Stack>
                                <Paper sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden' }}>
                                    <List>
                                        {filteredLogs.map((log) => (
                                            <ListItem key={log.id} divider>
                                                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                                    <Security color={log.action.includes('FAILURE') ? 'error' : (log.user_role === 'client' ? 'secondary' : 'primary')} />
                                                    <ListItemText
                                                        primary={log.action.replace(/_/g, " ")}
                                                        secondary={`${log.user_email} (${log.user_role || '?'}) • ${new Date(log.timestamp).toLocaleTimeString()}`}
                                                        primaryTypographyProps={{ fontWeight: 500 }}
                                                    />
                                                </Stack>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </Stack>
                        </Stack>
                    )}
                </Container>

                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.05)' }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={navValue}
                        onChange={(e, v) => setNavValue(v)}
                        sx={{ bgcolor: '#0B0C10', height: 80, '& .Mui-selected': { color: 'primary.main' } }}
                    >
                        <BottomNavigationAction label="Stats" icon={<BarChart />} />
                        <BottomNavigationAction label="Staff" icon={<People />} />
                        <BottomNavigationAction label="Chat" icon={<Chat />} />
                        <BottomNavigationAction label="Security" icon={<Security />} />
                    </BottomNavigation>
                </Paper>

                <Dialog open={openStaffModal} onClose={() => setOpenStaffModal(false)} PaperProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 3 } }}>
                    <DialogTitle>Hire New Staff</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                            <TextField label="Full Name" fullWidth variant="filled" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
                            <TextField label="Email (@vanguard.com)" fullWidth variant="filled" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} />
                            <TextField label="Password" type="password" fullWidth variant="filled" value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenStaffModal(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleCreateStaff} disabled={loading}>{loading ? <CircularProgress size={20} /> : "Hire"}</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={feedback.open} autoHideDuration={4000} onClose={() => setFeedback({ ...feedback, open: false })}>
                    <Alert severity={feedback.severity} variant="filled" sx={{ width: '100%' }}>{feedback.text}</Alert>
                </Snackbar>

            </Box>
        </ThemeProvider>
    );
}

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
                <Box sx={{ width: `${Math.min(count * 10, 100)}%`, height: '100%', bgcolor: color }} />
            </Box>
        </Stack>
    );
}
