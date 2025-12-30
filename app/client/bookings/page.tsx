"use client";

import { useState, useEffect } from "react";
import {
    Box, Typography, Container, Stack, Paper, Chip,
    BottomNavigation, BottomNavigationAction, ThemeProvider, CssBaseline,
    Fab, Divider, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Stepper, Step, StepLabel, TextField,
    MenuItem, CircularProgress, Snackbar, Alert, Avatar, IconButton
} from "@mui/material";
import { Home, Pets, CalendarMonth, Person, Add, LocationOn, AccessTime, CheckCircle, ArrowBack, ArrowForward, Close, Dangerous, Chat } from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

export default function BookingsView() {
    const router = useRouter();
    const [navValue, setNavValue] = useState(2); // Index 2 is Bookings

    // Data State
    const [bookings, setBookings] = useState<any[]>([]);
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // UI State
    const [showWizard, setShowWizard] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [bookingToCancel, setBookingToCancel] = useState<any>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        dog_ids: [] as string[],
        service_type: "Boarding",
        start_date: "",
        end_date: "",
        notes: "",
        total_price: 0
    });

    const steps = ['Select VIP', 'Dates & Service', 'Confirm'];

    const handleNavChange = (newValue: number) => {
        setNavValue(newValue);
        if (newValue === 0) router.push('/client/dashboard');
        if (newValue === 1) router.push('/client/pets');
        if (newValue === 3) router.push('/client/messenger');
        if (newValue === 4) router.push('/client/profile');
    };

    const fetchData = async () => {
        setLoading(true);
        const email = localStorage.getItem('vanguard_email');
        if (!email) return;

        try {
            const [bookingsRes, petsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/user/bookings?email=${encodeURIComponent(email)}`),
                fetch(`${API_BASE_URL}/api/pets?email=${encodeURIComponent(email)}`)
            ]);

            if (bookingsRes.ok) setBookings(await bookingsRes.json());
            if (petsRes.ok) setPets(await petsRes.json());
        } catch (err) {
            console.error("Fetch failed", err);
            setError("Failed to sync with server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Price Calculation Mock
    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

            let dailyRate = 45; // Standard Boarding
            if (formData.service_type === "Grooming") dailyRate = 65;
            if (formData.service_type === "Daycare") dailyRate = 35;

            let total = diffDays * dailyRate * (formData.dog_ids.length || 1);
            setFormData(prev => ({ ...prev, total_price: total }));
        }
    }, [formData.start_date, formData.end_date, formData.service_type, formData.dog_ids]);

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleCreateBooking = async () => {
        const email = localStorage.getItem('vanguard_email');
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: email,
                    ...formData
                })
            });

            if (res.ok) {
                setSuccessMsg("Reservation confirmed! 🍾");
                setShowWizard(false);
                setActiveStep(0);
                setFormData({ dog_ids: [], service_type: "Boarding", start_date: "", end_date: "", notes: "", total_price: 0 });
                fetchData();
            } else {
                setError("Failed to create reservation.");
            }
        } catch (err) {
            setError("Network error.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;
        setCancelling(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingToCancel.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "Cancelled" })
            });

            if (res.ok) {
                setSuccessMsg("Reservation retracted.");
                setShowCancelConfirm(false);
                setBookingToCancel(null);
                fetchData();
            } else {
                setError("Failed to cancel reservation.");
            }
        } catch (err) {
            setError("Connection error.");
        } finally {
            setCancelling(false);
        }
    };

    const upcomingBookings = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled');
    const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>

                {/* Header */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">Reservations</Typography>
                        <Chip label={`${upcomingBookings.length} Active`} size="small" sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', fontWeight: 'bold' }} />
                    </Stack>
                </Paper>

                <Container maxWidth="sm" sx={{ pt: 2 }}>
                    <Stack spacing={3}>

                        {/* Section: UPCOMING */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2}>Your Stays</Typography>
                            {loading ? (
                                <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                            ) : upcomingBookings.length === 0 ? (
                                <Paper sx={{ mt: 1, p: 4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                                    <CalendarMonth sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">Ready for a getaway?</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Book a professional stay for your VIP.
                                    </Typography>
                                    <Button variant="outlined" startIcon={<Add />} onClick={() => setShowWizard(true)}>
                                        New Booking
                                    </Button>
                                </Paper>
                            ) : (
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    {upcomingBookings.map(b => (
                                        <BookingCard
                                            key={b.id}
                                            booking={b}
                                            pets={pets}
                                            onCancel={() => {
                                                setBookingToCancel(b);
                                                setShowCancelConfirm(true);
                                            }}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        {/* Section: PAST */}
                        {pastBookings.length > 0 && (
                            <Box>
                                <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2}>Past Activity</Typography>
                                <Stack spacing={1} sx={{ mt: 1 }}>
                                    {pastBookings.map(b => (
                                        <PastBookingCard key={b.id} booking={b} pets={pets} />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </Container>

                <Fab
                    color="primary"
                    sx={{ position: 'fixed', bottom: 90, right: 24, bgcolor: '#D4AF37', '&:hover': { bgcolor: '#b5952f' } }}
                    onClick={() => setShowWizard(true)}
                >
                    <Add />
                </Fab>

                {/* Cancellation Dialog */}
                <Dialog open={showCancelConfirm} onClose={() => !cancelling && setShowCancelConfirm(false)}>
                    <DialogContent sx={{ pt: 4, textAlign: 'center', bgcolor: '#1A1B1F' }}>
                        <Dangerous color="error" sx={{ fontSize: 54, mb: 2 }} />
                        <Typography variant="h6" fontWeight="bold">Cancel Reservation?</Typography>
                        <Typography variant="body2" color="text.secondary">Retract this request? This cannot be undone.</Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            <Button fullWidth variant="outlined" onClick={() => setShowCancelConfirm(false)} disabled={cancelling}>Keep</Button>
                            <Button fullWidth variant="contained" color="error" onClick={handleCancelBooking} disabled={cancelling}>
                                {cancelling ? <CircularProgress size={20} /> : "Cancel"}
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>

                {/* Booking Wizard */}
                <Dialog open={showWizard} onClose={() => !submitting && setShowWizard(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: '#1A1B1F', borderRadius: 3 } }}>
                    <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                        <Typography variant="h5" fontWeight="bold">New Reservation</Typography>
                        <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
                            {steps.map((label) => (
                                <Step key={label}><StepLabel><Typography variant="caption">{label}</Typography></StepLabel></Step>
                            ))}
                        </Stepper>
                    </DialogTitle>
                    <DialogContent sx={{ minHeight: 300, px: 3 }}>
                        {activeStep === 0 && (
                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                                {pets.map(pet => {
                                    const isSelected = formData.dog_ids.includes(pet.id);
                                    return (
                                        <Paper key={pet.id} onClick={() => setFormData(f => ({ ...f, dog_ids: isSelected ? f.dog_ids.filter(id => id !== pet.id) : [...f.dog_ids, pet.id] }))} sx={{ p: 2, borderRadius: 2, border: isSelected ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)', bgcolor: isSelected ? 'rgba(212, 175, 55, 0.05)' : 'transparent', cursor: 'pointer' }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={pet.image_url}>{pet.name[0]}</Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body1" fontWeight="bold">{pet.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{pet.breed}</Typography>
                                                </Box>
                                                {isSelected && <CheckCircle sx={{ color: '#D4AF37' }} />}
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}
                        {activeStep === 1 && (
                            <Stack spacing={3} sx={{ py: 2 }}>
                                <TextField select label="Service" fullWidth value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} variant="filled">
                                    <MenuItem value="Boarding">Boarding</MenuItem>
                                    <MenuItem value="Daycare">Daycare</MenuItem>
                                    <MenuItem value="Grooming">Grooming</MenuItem>
                                </TextField>
                                <Stack direction="row" spacing={2}>
                                    <TextField label="Check-in" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} variant="filled" />
                                    <TextField label="Check-out" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} variant="filled" />
                                </Stack>
                            </Stack>
                        )}
                        {activeStep === 2 && (
                            <Box sx={{ py: 2, textAlign: 'center' }}>
                                <Typography variant="h6">Ready to book?</Typography>
                                <Typography variant="body2" color="text.secondary">VIPs: {pets.filter(p => formData.dog_ids.includes(p.id)).map(p => p.name).join(", ")}</Typography>
                                <Typography variant="h4" sx={{ mt: 2, color: '#D4AF37' }}>${formData.total_price.toFixed(2)}</Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 4 }}>
                        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
                        <Box sx={{ flex: 1 }} />
                        {activeStep < 2 ? (
                            <Button variant="contained" disabled={formData.dog_ids.length === 0 || (activeStep === 1 && (!formData.start_date || !formData.end_date))} onClick={handleNext} sx={{ bgcolor: '#D4AF37', color: 'black' }}>Next</Button>
                        ) : (
                            <Button variant="contained" onClick={handleCreateBooking} disabled={submitting} sx={{ bgcolor: '#D4AF37', color: 'black' }}>Confirm</Button>
                        )}
                    </DialogActions>
                </Dialog>

                <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}><Alert severity="error">{error}</Alert></Snackbar>
                <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg("")}><Alert severity="success">{successMsg}</Alert></Snackbar>

                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
                    <BottomNavigation showLabels value={navValue} onChange={(e, v) => handleNavChange(v)} sx={{ bgcolor: '#0B0C10', height: 70, '& .Mui-selected': { color: '#D4AF37 !important' } }}>
                        <BottomNavigationAction label="Home" icon={<Home />} />
                        <BottomNavigationAction label="Pets" icon={<Pets />} />
                        <BottomNavigationAction label="Bookings" icon={<CalendarMonth />} />
                        <BottomNavigationAction label="Chat" icon={<Chat />} />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper>
            </Box>
        </ThemeProvider>
    );
}

function BookingCard({ booking, pets, onCancel }: any) {
    const pet = pets.find((p: any) => p.id === booking.dog_id);
    return (
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            {booking.status === 'Pending' && (
                <IconButton size="small" onClick={onCancel} sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary', '&:hover': { color: 'error.main' } }}><Close fontSize="small" /></IconButton>
            )}
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={pet?.image_url}>{pet?.name ? pet.name[0] : '?'}</Avatar>
                <Box sx={{ flex: 1 }}><Typography variant="subtitle1" fontWeight="bold">{booking.service_type}</Typography><Typography variant="body2" color="text.secondary">{pet?.name || 'Unknown'}</Typography></Box>
                <Chip label={booking.status.toUpperCase()} size="small" variant="outlined" color={booking.status === 'Confirmed' ? 'success' : 'warning'} />
            </Stack>
            <Divider sx={{ my: 1.5, opacity: 0.1 }} />
            <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CalendarMonth fontSize="inherit" /><Typography variant="caption">{booking.start_date} - {booking.end_date}</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Typography variant="caption" fontWeight="bold" color="primary">${booking.total_price.toFixed(2)}</Typography></Box>
            </Stack>
        </Paper>
    );
}

function PastBookingCard({ booking, pets }: any) {
    const pet = pets.find((p: any) => p.id === booking.dog_id);
    return (
        <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={pet?.image_url} sx={{ width: 30, height: 30, fontSize: '0.8rem' }}>{pet?.name[0]}</Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight="500">{booking.service_type}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">{booking.start_date}</Typography>
                            {booking.status === 'Cancelled' && (
                                <Chip label="Cancelled" size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }} />
                            )}
                        </Stack>
                    </Box>
                </Box>
                <Typography variant="caption" fontWeight="bold">${booking.total_price.toFixed(2)}</Typography>
            </Stack>
        </Paper>
    );
}
