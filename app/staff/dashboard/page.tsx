"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
// ... imports ...
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
    CardContent
} from "@mui/material";
import { Security, Task, Person, Logout, TrendingUp, AttachMoney, Pets, Badge, Delete, Add } from "@mui/icons-material";
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
    created_at: string;
}

interface DashboardStats {
    revenue: number;
    occupancy: number;
    active_guests: number;
    staff_count: number;
}

export default function StaffDashboard() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [name, setName] = useState("");

    // Data States
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const [staffList, setStaffList] = useState<User[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Modal States
    const [openStaffModal, setOpenStaffModal] = useState(false);
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffPasword, setNewStaffPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem('vanguard_role');
        const storedName = localStorage.getItem('vanguard_user');

        if (!storedRole || (storedRole !== 'staff' && storedRole !== 'owner')) {
            router.push('/login');
            return;
        }

        setRole(storedRole);
        setName(storedName || "Staff");

        if (storedRole === 'owner') {
            fetchLogs();
            fetchClients();
            fetchStaff();
            fetchStats();
        } else if (storedRole === 'staff') {
            fetchClients();
        }
    }, [router]);

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/audit`);
            if (res.ok) setAuditLogs(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/staff/clients`);
            if (res.ok) setClients(await res.json());
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
                    password: newStaffPasword
                })
            });

            if (res.ok) {
                setOpenStaffModal(false);
                setNewStaffEmail("");
                setNewStaffName("");
                setNewStaffPassword("");
                fetchStaff(); // Refresh list
                fetchLogs(); // Log user creation
            } else {
                alert("Failed to create staff. Ensure email ends with @vanguard.com");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateStaff = async (email: string) => {
        if (!confirm(`Are you sure you want to TERMINATE access for ${email}? This cannot be undone.`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/staff/${email}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStaff();
                fetchLogs();
            }
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('vanguard_token');
        localStorage.removeItem('vanguard_role');
        localStorage.removeItem('vanguard_user');
        router.push('/client/login');
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', pb: 8 }}>
                <Container maxWidth="xl" sx={{ pt: 4 }}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
                        <Box>
                            <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.2em' }}>
                                VANGUARD KENNEL SYSTEMS
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {role === 'owner' ? 'Command Center' : 'Staff Operations'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Operator: {name}
                            </Typography>
                        </Box>
                        <Chip
                            icon={<Logout sx={{ width: 16 }} />}
                            label="LOGOUT"
                            onClick={handleLogout}
                            variant="outlined"
                            sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.1)' }}
                        />
                    </Stack>

                    {/* OWNER STATS ROW */}
                    {role === 'owner' && stats && (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={6}>
                            <Box flex={1}>
                                <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <CardContent>
                                        <Typography color="text.secondary" variant="overline">Projected Revenue</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <AttachMoney color="success" />
                                            <Typography variant="h4" fontWeight="bold">${stats.revenue.toLocaleString()}</Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box flex={1}>
                                <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <CardContent>
                                        <Typography color="text.secondary" variant="overline">Capacity / Occupancy</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <TrendingUp color="primary" />
                                            <Typography variant="h4" fontWeight="bold">{stats.occupancy} <span style={{ fontSize: '1rem', color: 'gray' }}>/ 50</span></Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box flex={1}>
                                <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <CardContent>
                                        <Typography color="text.secondary" variant="overline">Active Guests</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Pets color="secondary" />
                                            <Typography variant="h4" fontWeight="bold">{stats.active_guests}</Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box flex={1}>
                                <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <CardContent>
                                        <Typography color="text.secondary" variant="overline">Active Staff</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Badge color="info" />
                                            <Typography variant="h4" fontWeight="bold">{stats.staff_count}</Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Stack>
                    )}

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                        {/* LEFT COLUMN: Main Content */}
                        <Box sx={{ flex: 2, minWidth: 0 }}>
                            {/* OWNER VIEW: STAFF MANAGEMENT */}
                            {role === 'owner' && (
                                <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Badge color="primary" />
                                            <Typography variant="h6">Staff Management</Typography>
                                        </Stack>
                                        <Button startIcon={<Add />} variant="contained" size="small" onClick={() => setOpenStaffModal(true)}>
                                            Add Staff
                                        </Button>
                                    </Stack>

                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: 'gray' }}>Name</TableCell>
                                                    <TableCell sx={{ color: 'gray' }}>Email</TableCell>
                                                    <TableCell sx={{ color: 'gray' }}>Role</TableCell>
                                                    <TableCell align="right" sx={{ color: 'gray' }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {staffList.map((staff) => (
                                                    <TableRow key={staff.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{staff.name}</TableCell>
                                                        <TableCell sx={{ color: 'text.secondary' }}>{staff.email}</TableCell>
                                                        <TableCell>
                                                            <Chip label="STAFF" size="small" color="default" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
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
                                </Paper>
                            )}

                            {/* OWNER VIEW: SECURITY LOGS */}
                            {role === 'owner' && (
                                <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                                        <Security color="primary" />
                                        <Typography variant="h6">Security Audit Stream</Typography>
                                    </Stack>
                                    <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                                        {auditLogs.map((log) => (
                                            <ListItem key={log.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <ListItemText
                                                    primary={<span style={{ color: log.action.includes("FAILURE") || log.action.includes("TERMINAT") ? '#ff4444' : 'white' }}>{log.action}</span>}
                                                    secondary={<span style={{ color: 'gray' }}>{log.user_email} • {new Date(log.timestamp).toLocaleTimeString()}</span>}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            )}

                            {/* CLIENTS LIST (Shared) */}
                            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                                    <Person color="primary" />
                                    <Typography variant="h6">New Member Applications</Typography>
                                </Stack>
                                <List dense>
                                    {clients.map((client) => (
                                        <ListItem key={client.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <ListItemText
                                                primary={<Typography fontWeight="bold" color="white">{client.name}</Typography>}
                                                secondary={<Typography variant="caption" color="text.secondary">{client.email}</Typography>}
                                            />
                                            <Chip label="PENDING" size="small" color="warning" variant="outlined" sx={{ fontSize: '0.6rem' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Box>

                        {/* RIGHT COLUMN: Sidebar (Could be tasks for staff, or quick stats) */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Paper sx={{ p: 3, bgcolor: 'rgba(5,6,8,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Typography variant="subtitle2" color="text.secondary">SYSTEM STATUS</Typography>
                                <Stack spacing={2} mt={2}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="white">Database</Typography>
                                        <Typography color="success.main">ONLINE</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="white">WebAuthn</Typography>
                                        <Typography color="success.main">ACTIVE</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="white">Live Cams</Typography>
                                        <Typography color="warning.main">OFFLINE</Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Box>
                    </Stack>

                    {/* STAFF MODAL */}
                    <Dialog open={openStaffModal} onClose={() => setOpenStaffModal(false)} PaperProps={{ sx: { bgcolor: '#1a1a1a', border: '1px solid #333' } }}>
                        <DialogTitle color="white">Hire New Staff</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                                <TextField
                                    label="Full Name"
                                    fullWidth variant="filled"
                                    InputProps={{ style: { color: 'white' } }}
                                    InputLabelProps={{ style: { color: 'gray' } }}
                                    value={newStaffName}
                                    onChange={(e) => setNewStaffName(e.target.value)}
                                />
                                <TextField
                                    label="Email (@vanguard.com)"
                                    fullWidth variant="filled"
                                    InputProps={{ style: { color: 'white' } }}
                                    InputLabelProps={{ style: { color: 'gray' } }}
                                    value={newStaffEmail}
                                    onChange={(e) => setNewStaffEmail(e.target.value)}
                                />
                                <TextField
                                    label="Initial Password"
                                    type="password"
                                    fullWidth variant="filled"
                                    InputProps={{ style: { color: 'white' } }}
                                    InputLabelProps={{ style: { color: 'gray' } }}
                                    value={newStaffPasword}
                                    onChange={(e) => setNewStaffPassword(e.target.value)}
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenStaffModal(false)} color="inherit">Cancel</Button>
                            <Button onClick={handleCreateStaff} variant="contained" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : "Hire Staff"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                </Container>
            </Box>
        </ThemeProvider>
    );
}
