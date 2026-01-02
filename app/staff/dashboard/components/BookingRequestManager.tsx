import { Box, Button, Chip, Paper, Stack, Typography, CircularProgress } from "@mui/material";
import { CheckCircle, Cancel, Message } from "@mui/icons-material";
import { GroupedBookingRequest, EnrichedBooking } from "@/types";
import { motion } from "framer-motion";

interface BookingRequestManagerProps {
    pendingBookings: GroupedBookingRequest[];
    recentBookings: GroupedBookingRequest[];
    loading: boolean;
    onAction: (bookings: EnrichedBooking[], action: 'confirmed' | 'declined' | 'cancelled' | 'No Show') => void;
    onChat: (email: string) => void;
}

export default function BookingRequestManager({
    pendingBookings,
    recentBookings,
    loading,
    onAction,
    onChat
}: BookingRequestManagerProps) {
    if (loading) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#3b82f6' }} />
            </Box>
        );
    }

    if (pendingBookings.length === 0 && recentBookings.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Typography color="#64748b">No pending requests or recent history.</Typography>
            </Paper>
        );
    }

    return (
        <Stack spacing={4}>
            {/* PENDING SECTION */}
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'white' }}>
                    Pending Requests {pendingBookings.length > 0 && `(${pendingBookings.length})`}
                </Typography>

                {pendingBookings.length === 0 ? (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>All caught up!</Typography>
                ) : (
                    <Stack spacing={2}>
                        {pendingBookings.map((group) => (
                            <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
                                        {/* Left: Owner Info */}
                                        <Box sx={{ minWidth: 200 }}>
                                            <Typography variant="h6" fontWeight="bold">{group.owner_name}</Typography>
                                            <Button
                                                startIcon={<Message />}
                                                size="small"
                                                onClick={() => onChat(group.owner_email)}
                                                sx={{ color: 'text.secondary', textTransform: 'none', p: 0, '&:hover': { color: '#3b82f6', bgcolor: 'transparent' } }}
                                            >
                                                Message Owner
                                            </Button>
                                        </Box>

                                        {/* Middle: Order Details */}
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" color="text.secondary" mb={1}>
                                                Requesting <strong>{group.bookings.length} Services</strong> • {new Date(group.start_date + 'T00:00:00').toLocaleDateString()} - {new Date(group.end_date + 'T00:00:00').toLocaleDateString()}
                                            </Typography>
                                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                                {group.bookings.map((booking, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={`${booking.dog_name || 'Dog'} • ${booking.service_type}`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.primary' }}
                                                    />
                                                ))}
                                            </Stack>
                                            {/* Total Price Sum */}
                                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#10b981', fontWeight: 'bold' }}>
                                                Total: ${group.bookings.reduce((sum: number, b: EnrichedBooking) => sum + (b.total_price || 0), 0)}
                                            </Typography>
                                        </Box>

                                        {/* Right: Actions */}
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            spacing={2}
                                            sx={{ width: { xs: '100%', md: 'auto' } }}
                                        >
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<Cancel />}
                                                onClick={() => onAction(group.bookings, 'declined')}
                                                sx={{
                                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                                    color: '#ef4444',
                                                    flex: 1
                                                }}
                                            >
                                                Decline All
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircle />}
                                                onClick={() => onAction(group.bookings, 'confirmed')}
                                                sx={{
                                                    bgcolor: '#22c55e',
                                                    '&:hover': { bgcolor: '#16a34a' },
                                                    flex: 1
                                                }}
                                            >
                                                Accept Order
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </motion.div>
                        ))}
                    </Stack>
                )}
            </Box>

            {/* RECENTLY CONFIRMED SECTION */}
            {recentBookings.length > 0 && (
                <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'text.secondary' }}>Recently Confirmed</Typography>
                    <Stack spacing={2} sx={{ opacity: 0.8 }}>
                        {recentBookings.map((group) => (
                            <Paper key={group.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">{group.owner_name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {group.bookings.length} Services • {new Date(group.start_date + 'T00:00:00').toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: { xs: 1, sm: 0 } }}>
                                        {group.bookings.some((b: any) => b.status === "Checked In") ? (
                                            <Chip label="Checked In" size="small" color="info" variant="filled" />
                                        ) : group.bookings.some((b: any) => b.status === "No Show") ? (
                                            <Chip label="No Show" size="small" color="warning" variant="filled" />
                                        ) : (
                                            <>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="warning"
                                                    onClick={() => onAction(group.bookings, 'No Show')}
                                                    sx={{
                                                        minWidth: 'auto',
                                                        px: 1.5,
                                                        textTransform: 'none',
                                                        borderColor: 'rgba(245, 158, 11, 0.5)',
                                                        color: '#f59e0b',
                                                        fontWeight: 'bold',
                                                        '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.1)' }
                                                    }}
                                                >
                                                    No Show
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => onAction(group.bookings, 'cancelled')}
                                                    sx={{
                                                        minWidth: 'auto',
                                                        px: 1.5,
                                                        textTransform: 'none',
                                                        borderColor: 'rgba(239, 68, 68, 0.5)',
                                                        color: '#ef4444',
                                                        fontWeight: 'bold',
                                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Chip
                                                    icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
                                                    label="Confirmed"
                                                    size="small"
                                                    color="success"
                                                    variant="filled"
                                                    sx={{ ml: 1, fontWeight: 'bold' }}
                                                />
                                            </>
                                        )}
                                    </Stack>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            )}
        </Stack>
    );
}
