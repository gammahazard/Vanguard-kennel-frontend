import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack,
    Box,
    Chip,
    Divider,
    Avatar
} from "@mui/material";
import { Person, CalendarMonth, Pets, AttachMoney } from "@mui/icons-material";
import { GroupedBookingRequest, EnrichedBooking } from "@/types";
import { API_BASE_URL } from "@/lib/api";

interface BookingDetailsModalProps {
    open: boolean;
    onClose: () => void;
    group: GroupedBookingRequest | null;
}

export default function BookingDetailsModal({ open, onClose, group }: BookingDetailsModalProps) {
    if (!group) return null;

    const total = group.bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const tax = total * 0.13;
    const finalTotal = total + tax;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">Booking Details</Typography>
                    <Chip label="Confirmed" color="success" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                </Stack>
                <Typography variant="caption" color="text.secondary">ID: {group.id.slice(0, 8)}</Typography>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Stack spacing={3}>
                    {/* Owner Section */}
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight="bold">Client</Typography>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                            <Avatar sx={{ bgcolor: '#3b82f6' }}>{group.owner_name.charAt(0)}</Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{group.owner_name}</Typography>
                                <Typography variant="body2" color="text.secondary">{group.owner_email}</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Dates Section */}
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight="bold">Schedule</Typography>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                            <CalendarMonth sx={{ color: 'text.secondary' }} />
                            <Typography variant="body1">
                                {new Date(group.start_date + 'T00:00:00').toLocaleDateString()} — {new Date(group.end_date + 'T00:00:00').toLocaleDateString()}
                            </Typography>
                        </Stack>
                    </Box>

                    <Divider sx={{ opacity: 0.1 }} />

                    {/* Pets & Services */}
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight="bold">Guests & Services</Typography>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {group.bookings.map((booking: EnrichedBooking, i: number) => (
                                <Stack key={i} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            src={booking.dog_photo_url ? (booking.dog_photo_url.startsWith('http') ? booking.dog_photo_url : `${API_BASE_URL}${booking.dog_photo_url}`) : undefined}
                                            sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}
                                        >
                                            <Pets fontSize="small" />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{booking.dog_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{booking.service_type}</Typography>
                                        </Box>
                                    </Stack>
                                    <Typography variant="body2" fontWeight="bold">${booking.total_price.toFixed(2)}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>

                    <Divider sx={{ opacity: 0.1 }} />

                    {/* Financials */}
                    <Stack direction="row" justifyContent="flex-end" spacing={4} sx={{ pr: 1 }}>
                        <Stack alignItems="flex-end">
                            <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                            <Typography variant="body2">${total.toFixed(2)}</Typography>
                        </Stack>
                        <Stack alignItems="flex-end">
                            <Typography variant="caption" color="text.secondary">Tax (13%)</Typography>
                            <Typography variant="body2">${tax.toFixed(2)}</Typography>
                        </Stack>
                        <Stack alignItems="flex-end">
                            <Typography variant="caption" color="primary" fontWeight="bold">Total</Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">${finalTotal.toFixed(2)}</Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
