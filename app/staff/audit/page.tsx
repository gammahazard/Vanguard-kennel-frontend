"use client";

import { Box, Typography, Paper, Stack, Container, Chip, IconButton, CircularProgress, Divider, TextField, InputAdornment, Button } from "@mui/material";
import {
    Security,
    Search,
    FilterList,
    History,
    Warning,
    Refresh,
    Person,
    AttachMoney,
    Settings,
    Lock
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";

interface AuditLog {
    id: number;
    user_email: string;
    action: string;
    timestamp: string;
    ip_address?: string;
    user_role?: string;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<'all' | 'staff' | 'client'>('all');
    const [filterType, setFilterType] = useState<'all' | 'security' | 'financial' | 'system'>('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("vanguard_token");
            const res = await fetch(`${API_BASE_URL}/api/admin/audit`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionType = (action: string) => {
        if (action.includes('LOGIN') || action.includes('AUTH') || action.includes('SECURITY')) return 'security';
        if (action.includes('PAYMENT') || action.includes('BOOKING') || action.includes('REFUND')) return 'financial';
        return 'system'; // Default
    };

    const getActionColor = (type: string) => {
        if (type === 'security') return '#ef4444'; // Red
        if (type === 'financial') return '#22c55e'; // Green
        return '#3b82f6'; // Blue
    };

    const getActionIcon = (type: string) => {
        if (type === 'security') return <Lock sx={{ fontSize: 14 }} />;
        if (type === 'financial') return <AttachMoney sx={{ fontSize: 14 }} />;
        return <Settings sx={{ fontSize: 14 }} />;
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.ip_address && log.ip_address.includes(searchTerm));

        if (!matchesSearch) return false;

        // Role Filter (Approximation based on email if role not explicit, or use mock logic)
        const isStaff = log.user_email.includes('vanguard') || log.user_email.includes('admin') || log.user_role === 'staff' || log.user_role === 'owner';
        if (filterRole === 'staff' && !isStaff) return false;
        if (filterRole === 'client' && isStaff) return false;

        // Type Filter
        const type = getActionType(log.action);
        if (filterType !== 'all' && type !== filterType) return false;

        return true;
    });

    return (
        <Box sx={{ p: 4, bgcolor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
            <Container maxWidth="xl">

                {/* Header */}
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <History sx={{ color: '#94a3b8' }} />
                            <Typography variant="overline" color="#94a3b8" fontWeight="bold" letterSpacing={1}>
                                SYSTEM OVERSIGHT
                            </Typography>
                        </Stack>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', fontFamily: 'monospace' }}>
                            Unknown_Logs.sys
                        </Typography>
                        <Typography variant="body2" color="#64748b">
                            Complete system event history. Immutable record.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                            icon={<Warning sx={{ color: '#ef4444 !important' }} />}
                            label={`${logs.filter(l => l.action.includes('FAILURE')).length} Security Events`}
                            sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid' }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchLogs}
                            sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Stack>

                {/* Filters */}
                <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                        <TextField
                            fullWidth
                            placeholder="Search IP, User, or Action ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search sx={{ color: '#64748b' }} /></InputAdornment>,
                                sx: { bgcolor: '#0f172a', borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } }
                            }}
                            size="small"
                        />

                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: 'rgba(255,255,255,0.1)' }} />

                        <Stack direction="row" spacing={1}>
                            <Typography variant="caption" color="#64748b" sx={{ alignSelf: 'center', mr: 1, fontWeight: 'bold' }}>ROLE:</Typography>
                            {(['all', 'staff', 'client'] as const).map((r) => (
                                <Chip
                                    key={r}
                                    label={r.toUpperCase()}
                                    onClick={() => setFilterRole(r)}
                                    sx={{
                                        bgcolor: filterRole === r ? 'white' : 'transparent',
                                        color: filterRole === r ? 'black' : '#94a3b8',
                                        fontWeight: 'bold',
                                        border: filterRole === r ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: filterRole === r ? 'white' : 'rgba(255,255,255,0.05)' }
                                    }}
                                />
                            ))}
                        </Stack>

                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: 'rgba(255,255,255,0.1)' }} />

                        <Stack direction="row" spacing={1}>
                            <Typography variant="caption" color="#64748b" sx={{ alignSelf: 'center', mr: 1, fontWeight: 'bold' }}>TYPE:</Typography>
                            {(['all', 'security', 'financial', 'system'] as const).map((t) => (
                                <Chip
                                    key={t}
                                    label={t.toUpperCase()}
                                    onClick={() => setFilterType(t)}
                                    sx={{
                                        bgcolor: filterType === t ? getActionColor(t) : 'transparent',
                                        color: filterType === t ? 'white' : '#94a3b8',
                                        fontWeight: 'bold',
                                        border: filterType === t ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Paper>

                {/* Log Grid (Terminal Style) */}
                <Paper sx={{ bgcolor: '#000', border: '1px solid #334155', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ p: 1.5, bgcolor: '#1e293b', borderBottom: '1px solid #334155', display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr 2fr 1fr', gap: 2 }}>
                        <Typography variant="caption" color="#94a3b8" fontWeight="bold">TIMESTAMP</Typography>
                        <Typography variant="caption" color="#94a3b8" fontWeight="bold">USER</Typography>
                        <Typography variant="caption" color="#94a3b8" fontWeight="bold">ROLE</Typography>
                        <Typography variant="caption" color="#94a3b8" fontWeight="bold">ACTION</Typography>
                        <Typography variant="caption" color="#94a3b8" fontWeight="bold" textAlign="right">IP ADDRESS</Typography>
                    </Box>

                    <Stack spacing={0} sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        {loading ? (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <CircularProgress size={24} sx={{ color: '#3b82f6' }} />
                            </Box>
                        ) : (
                            filteredLogs.map((log, i) => {
                                const type = getActionType(log.action);
                                const color = getActionColor(type);

                                return (
                                    <Box
                                        key={i}
                                        sx={{
                                            p: 1.5,
                                            display: 'grid',
                                            gridTemplateColumns: '0.8fr 1.5fr 1fr 2fr 1fr',
                                            gap: 2,
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            fontFamily: 'monospace',
                                            fontSize: '0.85rem',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <Typography color="#64748b">{new Date(log.timestamp).toLocaleDateString()} <span style={{ opacity: 0.5 }}>{new Date(log.timestamp).toLocaleTimeString()}</span></Typography>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Person sx={{ fontSize: 14, color: '#475569' }} />
                                            <Typography color="#f1f5f9">{log.user_email}</Typography>
                                        </Stack>

                                        <Box>
                                            <Chip
                                                label={(log.user_role || (log.user_email.includes('vanguard') ? 'STAFF' : 'CLIENT')).toUpperCase()}
                                                size="small"
                                                sx={{
                                                    height: 18,
                                                    fontSize: '0.65rem',
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                    color: '#94a3b8',
                                                    borderRadius: 0.5
                                                }}
                                            />
                                        </Box>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ color: color, display: 'flex' }}>{getActionIcon(type)}</Box>
                                            <Typography sx={{ color: color }}>{log.action}</Typography>
                                        </Stack>

                                        <Typography color="#64748b" textAlign="right" sx={{ opacity: 0.7 }}>{log.ip_address || "127.0.0.1"}</Typography>
                                    </Box>
                                );
                            })
                        )}
                        {!loading && filteredLogs.length === 0 && (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <Typography color="#64748b">No logs found matching criteria.</Typography>
                            </Box>
                        )}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
