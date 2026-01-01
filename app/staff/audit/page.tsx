"use client";

import { Box, Typography, Paper, Stack, Container, Chip, CircularProgress, TextField, InputAdornment, Button } from "@mui/material";
import {
    Search,
    History,
    Warning,
    Refresh,
    Person,
    AttachMoney,
    Settings,
    Lock
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import IPLocation from "@/components/ui/IPLocation";

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
        if (action.includes('LOGIN') || action.includes('AUTH') || action.includes('SECURITY') || action.includes('FAILURE')) return 'security';
        if (action.includes('PAYMENT') || action.includes('BOOKING') || action.includes('REFUND')) return 'financial';
        return 'system';
    };

    const getActionColor = (type: string) => {
        if (type === 'security') return '#ef4444';
        if (type === 'financial') return '#22c55e';
        return '#D4AF37';
    };

    const getActionIcon = (type: string) => {
        if (type === 'security') return <Lock sx={{ fontSize: 16 }} />;
        if (type === 'financial') return <AttachMoney sx={{ fontSize: 16 }} />;
        return <Settings sx={{ fontSize: 16 }} />;
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.ip_address && log.ip_address.includes(searchTerm));

        if (!matchesSearch) return false;

        const isStaff = log.user_email.includes('vanguard') || log.user_email.includes('admin') || log.user_role === 'staff' || log.user_role === 'owner';
        if (filterRole === 'staff' && !isStaff) return false;
        if (filterRole === 'client' && isStaff) return false;

        const type = getActionType(log.action);
        if (filterType !== 'all' && type !== filterType) return false;

        return true;
    });

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0B0C10', minHeight: '100vh', color: '#f8fafc' }}>
            <Container maxWidth="lg">

                {/* Header */}
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <History sx={{ color: '#D4AF37' }} />
                            <Typography variant="overline" color="#D4AF37" fontWeight="bold" letterSpacing={1}>
                                SYSTEM OVERSIGHT
                            </Typography>
                        </Stack>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                            Audit Logs
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Chip
                            icon={<Warning sx={{ color: '#ef4444 !important' }} />}
                            label={`${logs.filter(l => l.action.includes('FAILURE')).length} Alerts`}
                            size="small"
                            sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        />
                        <Button
                            size="small"
                            startIcon={<Refresh />}
                            onClick={fetchLogs}
                            sx={{ color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)', border: '1px solid' }}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Stack>

                {/* Search & Filters */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            placeholder="Search user, action, or IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search sx={{ color: '#D4AF37' }} /></InputAdornment>,
                                sx: { bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(212, 175, 55, 0.2)' } }
                            }}
                            size="small"
                        />

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>FILTER:</Typography>

                            {/* Role Filters */}
                            {(['all', 'staff', 'client'] as const).map((r) => (
                                <Chip
                                    key={r}
                                    label={r === 'all' ? 'ALL ROLES' : r.toUpperCase()}
                                    onClick={() => setFilterRole(r)}
                                    size="small"
                                    sx={{
                                        bgcolor: filterRole === r ? '#D4AF37' : 'transparent',
                                        color: filterRole === r ? 'black' : '#94a3b8',
                                        fontWeight: 'bold',
                                        border: filterRole === r ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}

                            <Box sx={{ width: 1, height: 20, bgcolor: 'rgba(255,255,255,0.1)', mx: 1 }} />

                            {/* Type Filters */}
                            {(['all', 'security', 'financial', 'system'] as const).map((t) => (
                                <Chip
                                    key={t}
                                    label={t === 'all' ? 'ALL ACTIONS' : t.toUpperCase()}
                                    onClick={() => setFilterType(t)}
                                    size="small"
                                    sx={{
                                        bgcolor: filterType === t ? getActionColor(t) : 'transparent', // Use color for active state
                                        color: filterType === t ? (t === 'security' || t === 'financial' ? 'white' : 'black') : '#94a3b8',
                                        fontWeight: 'bold',
                                        border: filterType === t ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Paper>

                {/* Log Cards */}
                <Stack spacing={1.5}>
                    {loading ? (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <CircularProgress size={32} sx={{ color: '#D4AF37' }} />
                        </Box>
                    ) : filteredLogs.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                            <Typography color="#64748b">No logs found.</Typography>
                        </Paper>
                    ) : (
                        filteredLogs.map((log, i) => {
                            const type = getActionType(log.action);
                            const color = getActionColor(type);
                            const isStaff = log.user_email.includes('vanguard') || log.user_role === 'staff' || log.user_role === 'owner';

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                >
                                    <Paper sx={{
                                        p: 2,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 2,
                                        borderLeft: `3px solid ${color}`,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                                        transition: 'all 0.2s'
                                    }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                                                <Box sx={{ color: color, display: 'flex' }}>{getActionIcon(type)}</Box>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: color }}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                        <Person sx={{ fontSize: 14, color: '#64748b' }} />
                                                        <Typography variant="caption" color="#94a3b8" sx={{ wordBreak: 'break-all' }}>
                                                            {log.user_email}
                                                        </Typography>
                                                        <Chip
                                                            label={isStaff ? 'STAFF' : 'CLIENT'}
                                                            size="small"
                                                            sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}
                                                        />
                                                    </Stack>
                                                </Box>
                                            </Stack>

                                            <Stack direction={{ xs: 'row', sm: 'column' }} spacing={0.5} alignItems={{ xs: 'center', sm: 'flex-end' }} sx={{ minWidth: 'fit-content' }}>
                                                <Typography variant="caption" color="#64748b">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </Typography>
                                                <IPLocation ip={log.ip_address || "127.0.0.1"} />
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                </motion.div>
                            );
                        })
                    )}
                </Stack>
            </Container>
        </Box>
    );
}
