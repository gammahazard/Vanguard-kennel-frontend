"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    Chip,
    Stack,
    ThemeProvider,
    Button
} from "@mui/material";
import { Security, Task, Person, Logout } from "@mui/icons-material";
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

export default function StaffDashboard() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [clients, setClients] = useState<User[]>([]); // New State
    const [name, setName] = useState("");

    useEffect(() => {
        // 1. Verify Access
        const storedRole = localStorage.getItem('vanguard_role');
        const storedName = localStorage.getItem('vanguard_user');

        if (!storedRole || (storedRole !== 'staff' && storedRole !== 'owner')) {
            router.push('/login');
            return;
        }

        setRole(storedRole);
        setName(storedName || "Staff");

        // 2. Fetch Data
        if (storedRole === 'owner') {
            fetchLogs();
            fetchClients(); // Owner sees both
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

    const handleLogout = () => {
        localStorage.clear();
        router.push('/');
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: 4 }}>
                <Container maxWidth="lg">
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

                    <Grid container spacing={4}>
                        {/* LEFT COLUMN: Main Feed */}
                        <Grid xs={12} md={8}>
                            {/* OWNER VIEW: SECURITY LOGS */}
                            {role === 'owner' && (
                                <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                                    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                                        <Security color="primary" />
                                        <Typography variant="h6">Live Security Audit</Typography>
                                    </Stack>
                                    <List dense>
                                        {auditLogs.map((log) => (
                                            <ListItem key={log.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <ListItemText
                                                    primary={<span style={{ color: 'white' }}>{log.action}</span>}
                                                    secondary={<span style={{ color: 'gray' }}>{log.user_email} • {new Date(log.timestamp).toLocaleTimeString()}</span>}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            )}

                            {/* STAFF/OWNER VIEW: NEW CLIENTS */}
                            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                                    <Person color="primary" />
                                    <Typography variant="h6">New Member Applications</Typography>
                                </Stack>

                                <List>
                                    {clients.map((client) => (
                                        <ListItem key={client.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Typography fontWeight="bold" color="white">{client.name}</Typography>
                                                        <Chip label="PENDING REVIEW" size="small" color="warning" variant="outlined" sx={{ fontSize: '0.6rem' }} />
                                                    </Stack>
                                                }
                                                secondary={
                                                    <Stack spacing={0.5} mt={0.5}>
                                                        <Typography variant="caption" color="text.secondary">{client.email}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Joined: {new Date(client.created_at).toLocaleDateString()}</Typography>
                                                    </Stack>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                    {clients.length === 0 && (
                                        <Typography color="text.secondary" fontStyle="italic">No pending applications.</Typography>
                                    )}
                                </List>
                            </Paper>
                        </Grid>

                        {/* RIGHT COLUMN: Quick Stats */}
                        <Grid xs={12} md={4}>
                            <Stack spacing={3}>
                                <Paper sx={{ p: 3, bgcolor: 'rgba(5,6,8,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Typography variant="subtitle2" color="text.secondary">ACTIVE GUESTS</Typography>
                                    <Typography variant="h3" color="white">12</Typography>
                                </Paper>
                                {role === 'staff' && (
                                    <Paper sx={{ p: 3, bgcolor: 'rgba(5,6,8,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <Typography variant="subtitle2" color="text.secondary">QUICK TASKS</Typography>
                                        <Stack spacing={1} mt={2}>
                                            <Button variant="outlined" size="small" fullWidth>New Booking</Button>
                                            <Button variant="outlined" size="small" fullWidth>Check-In Guest</Button>
                                        </Stack>
                                    </Paper>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
