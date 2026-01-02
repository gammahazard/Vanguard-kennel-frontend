import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    AttachMoney,
    TrendingUp,
    TrendingDown,
    EventNote,
    People,
    Pets
} from '@mui/icons-material';
import { EnrichedBooking } from '@/types';

interface BusinessDashboardProps {
    bookings: EnrichedBooking[];
}

export default function BusinessDashboard({ bookings }: BusinessDashboardProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // 1. Generate Month Options (Last 12 Months)
    const monthOptions = useMemo(() => {
        const options = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            options.push({
                value: d.toISOString().slice(0, 7),
                label: d.toLocaleDateString('default', { month: 'long', year: 'numeric' })
            });
        }
        return options;
    }, []);

    // 2. Compute Metrics
    const metrics = useMemo(() => {
        const getStats = (monthStr: string) => {
            const revenue = bookings
                .filter(b => b.start_date.startsWith(monthStr) && b.is_paid)
                .reduce((sum, b) => sum + (b.total_price || 0), 0);

            // "Relevant" means either a real stay OR a paid penalty
            const relevantForCount = bookings.filter(b =>
                b.start_date.startsWith(monthStr) &&
                (!['cancelled', 'declined', 'no show', 'no-show'].includes(b.status?.toLowerCase() || '') || (b.is_paid && b.total_price > 0))
            );

            // "Services" are actual stays (excluding penalties)
            const stays = relevantForCount.filter(b => !['cancelled', 'declined', 'no show', 'no-show'].includes(b.status?.toLowerCase() || ''));

            const clients = new Set(relevantForCount.map(b => b.user_email)).size;
            const daycare = stays.filter(b => b.service_type.toLowerCase() === 'daycare').length;
            const boarding = stays.filter(b => b.service_type.toLowerCase() === 'boarding').length;

            return { relevant: relevantForCount, revenue, count: relevantForCount.length, clients, daycare, boarding };
        };

        const current = getStats(selectedMonth);

        // Previous Month Logic
        const [currYear, currMonth] = selectedMonth.split('-').map(Number);
        const prevDate = new Date(currYear, currMonth - 2, 1); // JS Month is 0-indexed
        const prevMonthStr = prevDate.toISOString().slice(0, 7);
        const previous = getStats(prevMonthStr);

        // Calculate % Changes
        const getPct = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        return {
            current,
            previous,
            changes: {
                revenue: getPct(current.revenue, previous.revenue),
                count: getPct(current.count, previous.count),
                clients: getPct(current.clients, previous.clients)
            }
        };

    }, [bookings, selectedMonth]);

    const ComparisonBadge = ({ value }: { value: number }) => {
        const isPositive = value >= 0;
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: isPositive ? 'success.main' : 'error.main',
                bgcolor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                typography: 'caption',
                fontWeight: 'bold'
            }}>
                {isPositive ? <TrendingUp fontSize="inherit" /> : <TrendingDown fontSize="inherit" />}
                {Math.abs(value).toFixed(1)}%
            </Box>
        );
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">Financial & Business Metrics</Typography>
                <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={selectedMonth}
                        label="Month"
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {monthOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {/* KPI CARDS (Replaced Grid with Stack for stability) */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
                {/* REVENUE */}
                <Box flex={1}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}><AttachMoney /></Box>
                            <ComparisonBadge value={metrics.changes.revenue} />
                        </Stack>
                        <Typography variant="h3" fontWeight="bold" my={1}>${metrics.current.revenue.toLocaleString()}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    </Paper>
                </Box>

                {/* BOOKINGS */}
                <Box flex={1}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><EventNote /></Box>
                            <ComparisonBadge value={metrics.changes.count} />
                        </Stack>
                        <Typography variant="h3" fontWeight="bold" my={1}>{metrics.current.count}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                    </Paper>
                </Box>

                {/* CLIENTS */}
                <Box flex={1}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><People /></Box>
                            <ComparisonBadge value={metrics.changes.clients} />
                        </Stack>
                        <Typography variant="h3" fontWeight="bold" my={1}>{metrics.current.clients}</Typography>
                        <Typography variant="body2" color="text.secondary">Active Clients</Typography>
                    </Paper>
                </Box>
            </Stack>

            {/* SERVICE SPLIT & DETAILS */}
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>Service Distribution</Typography>

                <Stack spacing={3}>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" fontWeight="medium">Boarding ({metrics.current.boarding})</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {metrics.current.count > 0 ? Math.round((metrics.current.boarding / metrics.current.count) * 100) : 0}%
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={metrics.current.count > 0 ? (metrics.current.boarding / metrics.current.count) * 100 : 0}
                            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' } }}
                        />
                    </Box>

                    <Box>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" fontWeight="medium">Daycare ({metrics.current.daycare})</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {metrics.current.count > 0 ? Math.round((metrics.current.daycare / metrics.current.count) * 100) : 0}%
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={metrics.current.count > 0 ? (metrics.current.daycare / metrics.current.count) * 100 : 0}
                            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' } }}
                        />
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}
