"use client";

import { useState, useEffect } from "react";
import {
    Box, Typography, Container, Stack, Paper, Chip,
    BottomNavigation, BottomNavigationAction, ThemeProvider, CssBaseline,
    Fab, Divider, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Stepper, Step, StepLabel, TextField,
    MenuItem, CircularProgress, Snackbar, Alert, Avatar, IconButton,
    Grid, Skeleton
} from "@mui/material";
import { Home, Pets, CalendarMonth, Person, Add, AccessTime, CheckCircle, Close, Dangerous, Chat, Warning, Info, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { sanitizeInput } from "@/lib/security";

import { authenticatedFetch } from "@/lib/api";
import { Service } from "@/types";

export default function BookingsView() {
    const router = useRouter();
    const [navValue, setNavValue] = useState(2); // Index 2 is Bookings

    // Data State
    const [bookings, setBookings] = useState<any[]>([]);
    const [pets, setPets] = useState<any[]>([]);
    const [availability, setAvailability] = useState<string[]>([]);
    const [services, setServices] = useState<Service[]>([]);
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

    const [agreements, setAgreements] = useState({
        cancel: false,
        noshow: false
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
        // We still check localStorage for existence, but token is handled by authenticatedFetch
        const email = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email') : null;
        if (!email) return;

        try {
            const [bookingsRes, petsRes, availRes, servicesRes] = await Promise.all([
                authenticatedFetch(`/api/user/bookings`),
                authenticatedFetch(`/api/pets`),
                authenticatedFetch(`/api/bookings/availability`),
                authenticatedFetch(`/api/services`)
            ]);

            if (bookingsRes.ok) setBookings(await bookingsRes.json());
            if (petsRes.ok) setPets(await petsRes.json());
            if (availRes.ok) setAvailability(await availRes.json());
            if (servicesRes.ok) setServices(await servicesRes.json());
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

    // Price Calculation
    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const diffTime = Math.abs(end.getTime() - start.getTime());

            // Logic Fix: Boarding is Per Night (diff), Daycare is Per Day (Inclusive +1)
            let units = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (formData.service_type === 'Daycare') {
                units += 1; // Inclusive for Daycare
            } else {
                // Boarding: Ensure at least 1 night
                units = units < 1 ? 1 : units;
            }

            // Dynamic Pricing from Backend
            const service = services.find(s => s.name === formData.service_type);
            const dailyRate = service ? service.price : 0;

            let total = units * dailyRate * (formData.dog_ids.length || 1);
            setFormData(prev => ({ ...prev, total_price: total }));
        }
    }, [formData.start_date, formData.end_date, formData.service_type, formData.dog_ids, services]);

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleCreateBooking = async () => {
        const email = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email') : null;
        setSubmitting(true);
        try {
            const res = await authenticatedFetch(`/api/bookings`, {
                method: 'POST',
                // Content-Type is added by authenticatedFetch
                body: JSON.stringify({
                    user_email: email, // Backend ignores this for Auth, but uses it for logic if needed (though it shouldn't rely on it for security)
                    ...formData
                })
            });

            if (res.ok) {
                setSuccessMsg("Reservation request submitted! 🍾");
                setShowWizard(false);
                setActiveStep(0);
                setFormData({ dog_ids: [], service_type: "Boarding", start_date: "", end_date: "", notes: "", total_price: 0 });
                fetchData();
            } else {
                // Only try to parse JSON on error responses
                const data = await res.json().catch(() => ({}));
                setError(data.error || `Error ${res.status}: Failed to create reservation.`);
            }
        } catch (err: any) {
            console.error("Booking error:", err);
            setError(err?.message || "Connection failed. Please check your internet.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;
        setCancelling(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${bookingToCancel.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: "cancelled" })
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

    const upcomingBookings = bookings.filter((b: any) => {
        const s = b.status?.toLowerCase();
        return s !== 'completed' && s !== 'cancelled' && s !== 'declined';
    });
    const pastBookings = bookings.filter((b: any) => {
        const s = b.status?.toLowerCase();
        return s === 'completed' || s === 'cancelled' || s === 'declined';
    });

    // Check if a date is full
    const isDateFull = (dateStr: string) => availability.includes(dateStr);

    const isRangeFull = (start: string, end: string) => {
        if (!start || !end) return false;
        const s = new Date(start);
        const e = new Date(end);
        if (s > e) return false;

        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            const dStr = d.toISOString().split('T')[0];
            if (availability.includes(dStr)) return true;
        }
        return false;
    };

    const isStayTooLong = (start: string, end: string) => {
        if (!start || !end) return false;
        const s = new Date(start);
        const e = new Date(end);
        // keep stays under 30 days for insurance/capacity reasons
        const diff = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 30;
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>

                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">Reservations</Typography>
                        <Chip label={`${upcomingBookings.length} Active`} size="small" sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', fontWeight: 'bold' }} />
                    </Stack>
                </Paper>

                <Container maxWidth="sm" sx={{ pt: 2 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2}>Your Stays</Typography>
                            {loading ? (
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    {[1, 2].map(i => (
                                        <Paper key={i} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Skeleton variant="circular" width={40} height={40} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Skeleton width="40%" height={20} />
                                                    <Skeleton width="20%" height={15} />
                                                </Box>
                                                <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
                                            </Stack>
                                            <Divider sx={{ my: 1.5, opacity: 0.1 }} />
                                            <Stack direction="row" spacing={2}>
                                                <Skeleton width="50%" height={15} />
                                                <Skeleton width="15%" height={15} />
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            ) : pets.length === 0 ? (
                                <Paper sx={{ mt: 1, p: 4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                                    <Pets sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>Register your VIPS first</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                                        Please register your VIPS (Very Important Pups) you want us to care for in order to begin the booking process.
                                    </Typography>
                                    <Button variant="contained" startIcon={<Pets />} onClick={() => router.push('/client/pets')} sx={{ bgcolor: '#D4AF37', color: 'black' }}>
                                        Register VIP
                                    </Button>
                                </Paper>
                            ) : upcomingBookings.length === 0 ? (
                                <Paper sx={{ mt: 1, p: 4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                    <CalendarMonth sx={{ fontSize: 48, color: 'primary.main', opacity: 0.5, mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No Active Reservations</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                                        Your VIPs are ready for an upgrade. Start a new booking to reserve their spot in our luxury kennels.
                                    </Typography>
                                    <Button variant="contained" startIcon={<Add />} onClick={() => setShowWizard(true)} sx={{ bgcolor: '#D4AF37', color: 'black' }}>
                                        New Booking
                                    </Button>
                                </Paper>
                            ) : (
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    {upcomingBookings.map(b => (
                                        <BookingCard key={b.id} booking={b} pets={pets} onCancel={() => { setBookingToCancel(b); setShowCancelConfirm(true); }} />
                                    ))}
                                </Stack>
                            )}
                        </Box>

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
                    sx={{ position: 'fixed', bottom: 90, right: 24, bgcolor: '#D4AF37' }}
                    onClick={() => pets.length > 0 ? setShowWizard(true) : router.push('/client/pets')}
                >
                    <Add />
                </Fab>

                {/* Wizard Dialog */}
                <Dialog open={showWizard} onClose={() => !submitting && setShowWizard(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: '#1A1B1F', borderRadius: 3 } }}>
                    <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                        <Typography variant="h5" fontWeight="bold">New Reservation</Typography>
                        <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
                            {steps.map((label) => (
                                <Step key={label}><StepLabel><Typography variant="caption">{label}</Typography></StepLabel></Step>
                            ))}
                        </Stepper>
                    </DialogTitle>
                    <DialogContent sx={{ minHeight: 450, px: 3 }}>
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
                                <TextField select label="Service" fullWidth value={formData.service_type} onChange={e => {
                                    const val = e.target.value;
                                    setFormData({ ...formData, service_type: val, end_date: val === 'Daycare' ? formData.start_date : formData.end_date });
                                }} variant="filled">
                                    <MenuItem value="Boarding">Boarding</MenuItem>
                                    <MenuItem value="Daycare">Daycare</MenuItem>
                                </TextField>

                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarMonth fontSize="small" />
                                        {formData.service_type === 'Daycare' ? 'Select Date' : 'Select Stay Period'}
                                    </Typography>
                                    <AvailabilityCalendar
                                        startDate={formData.start_date}
                                        endDate={formData.end_date}
                                        availability={availability}
                                        serviceType={formData.service_type}
                                        onChange={(start: string, end: string) => setFormData(prev => ({ ...prev, start_date: start, end_date: end }))}
                                    />
                                    {formData.start_date && formData.end_date && (
                                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
                                            <Chip
                                                label={`Duration: ${formData.service_type === 'Daycare'
                                                        ? Math.ceil(Math.abs(new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1 + " Day(s)"
                                                        : Math.max(1, Math.ceil(Math.abs(new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24))) + " Night(s)"
                                                    }`}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 'bold', borderRadius: 1.5, borderColor: 'rgba(212, 175, 55, 0.4)' }}
                                            />
                                        </Box>
                                    )}
                                </Box>

                                {isStayTooLong(formData.start_date, formData.end_date) && (
                                    <Alert severity="warning" sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                                        Maximum stay is 30 days. For longer periods, please contact us.
                                    </Alert>
                                )}

                                <TextField
                                    label="Stay Notes"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: sanitizeInput(e.target.value, 500) })}
                                    variant="filled"
                                    placeholder="Drop-off time, dietary specifics, etc."
                                />
                            </Stack>
                        )}
                        {activeStep === 2 && (
                            <Box sx={{ py: 2 }}>
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Typography variant="h6">Ready to book?</Typography>
                                    <Typography variant="body2" color="text.secondary">VIPs: {pets.filter(p => formData.dog_ids.includes(p.id)).map(p => p.name).join(", ")}</Typography>
                                    <Typography variant="body2" color="text.secondary">Dates: {formData.start_date} to {formData.end_date}</Typography>
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                                        <Typography variant="h4" sx={{ color: '#D4AF37' }}>${formData.total_price.toFixed(2)}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                            (${services.find(s => s.name === formData.service_type)?.price.toFixed(2) || '0.00'} / {formData.service_type === 'Daycare' ? 'day' : 'night'})
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Paper sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 2 }}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#ef4444', display: 'block', mb: 1, letterSpacing: 1 }}>
                                        PLATFORM STANDARDS
                                    </Typography>
                                    <Stack spacing={1}>
                                        <Stack direction="row" spacing={2} alignItems="start">
                                            <input type="checkbox" id="policy-cancel" style={{ marginTop: 4 }} onChange={e => setAgreements(p => ({ ...p, cancel: e.target.checked }))} />
                                            <label htmlFor="policy-cancel" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                                I understand a $45 fee applies to cancellations within 72h.
                                            </label>
                                        </Stack>
                                        <Stack direction="row" spacing={2} alignItems="start">
                                            <input type="checkbox" id="policy-noshow" style={{ marginTop: 4 }} onChange={e => setAgreements(p => ({ ...p, noshow: e.target.checked }))} />
                                            <label htmlFor="policy-noshow" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                                I confirm I will attend my slot. Uncommunicated absences risk suspension.
                                            </label>
                                        </Stack>
                                    </Stack>
                                </Paper>

                                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(212, 175, 55, 0.03)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Info sx={{ color: '#D4AF37', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">Review Required</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Our staff will manually review your request. Payment is only collected once your booking is confirmed.
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 4 }}>
                        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
                        <Box sx={{ flex: 1 }} />
                        <Button variant="contained"
                            disabled={
                                submitting ||
                                formData.dog_ids.length === 0 ||
                                (activeStep === 1 && (!formData.start_date || !formData.end_date || isRangeFull(formData.start_date, formData.end_date) || isStayTooLong(formData.start_date, formData.end_date))) ||
                                (activeStep === 2 && (!agreements.cancel || !agreements.noshow))
                            }
                            onClick={activeStep < 2 ? handleNext : handleCreateBooking}
                            sx={{ bgcolor: '#D4AF37', color: 'black', minWidth: 100 }}
                        >
                            {submitting ? <CircularProgress size={20} sx={{ color: 'black' }} /> : (activeStep < 2 ? "Next" : "Confirm")}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Cancel Confirm */}
                <Dialog open={showCancelConfirm} onClose={() => !cancelling && setShowCancelConfirm(false)}>
                    <DialogContent sx={{ pt: 4, textAlign: 'center', bgcolor: '#1A1B1F' }}>
                        <Dangerous color="error" sx={{ fontSize: 54, mb: 2 }} />
                        <Typography variant="h6" fontWeight="bold">Cancel Reservation?</Typography>
                        <Typography variant="body2" color="text.secondary">Retract this request?</Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            <Button fullWidth variant="outlined" onClick={() => setShowCancelConfirm(false)} disabled={cancelling}>Keep</Button>
                            <Button fullWidth variant="contained" color="error" onClick={handleCancelBooking} disabled={cancelling}>
                                {cancelling ? <CircularProgress size={20} /> : "Cancel"}
                            </Button>
                        </Stack>
                    </DialogContent>
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
        </ThemeProvider >
    );
}


function AvailabilityCalendar({ startDate, endDate, availability, serviceType, onChange }: any) {
    // custom inline calendar for premium ux. replaces clunky native pickers.
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Helper to get days in month
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleDateClick = (day: number) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = selected.toISOString().split('T')[0];

        if (serviceType === 'Daycare') {
            onChange(dateStr, dateStr);
            return;
        }

        if (!startDate || (startDate && endDate)) {
            // start fresh or reset range
            onChange(dateStr, "");
        } else {
            // selecting end date for a range
            const start = new Date(startDate);
            if (selected < start) {
                // if earlier, flip it to new start
                onChange(dateStr, "");
            } else {
                // valid check-out selected
                onChange(startDate, dateStr);
            }
        }
    };

    const isSelected = (day: number) => {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dStr = d.toISOString().split('T')[0];
        if (serviceType === 'Daycare') return startDate === dStr;
        if (startDate === dStr || endDate === dStr) return true;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            return d > start && d < end;
        }
        return false;
    };

    const isBooked = (day: number) => {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return availability.includes(d.toISOString().split('T')[0]);
    };

    const isPast = (day: number) => {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return d < today;
    };

    const isTooFar = (day: number) => {
        // limit stay selection grid based on 30 day max
        if (!startDate || endDate || serviceType === 'Daycare') return false;
        const start = new Date(startDate);
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const diff = Math.ceil(Math.abs(d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 30;
    };

    return (
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <IconButton size="small" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}><ChevronLeft /></IconButton>
                <Typography variant="body2" fontWeight="bold">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Typography>
                <IconButton size="small" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}><ChevronRight /></IconButton>
            </Stack>

            {/* Header days */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 1 }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <Typography key={d} variant="caption" sx={{ opacity: 0.5, fontSize: '0.6rem', fontWeight: 'bold' }}>{d}</Typography>
                ))}
            </Box>

            {/* Calendar grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {Array.from({ length: firstDay }).map((_, i) => <Box key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const full = isBooked(day);
                    const past = isPast(day);
                    const sel = isSelected(day);
                    const far = isTooFar(day);
                    const disabled = full || past || far;

                    return (
                        <Box
                            key={day}
                            onClick={() => !disabled && handleDateClick(day)}
                            sx={{
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1.5,
                                cursor: disabled ? 'default' : 'pointer',
                                fontSize: '0.8rem',
                                bgcolor: sel ? '#D4AF37' : 'transparent',
                                color: sel ? 'black' : (disabled ? 'rgba(255,255,255,0.1)' : 'white'),
                                position: 'relative',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: disabled ? 'transparent' : (sel ? '#D4AF37' : 'rgba(212, 175, 55, 0.1)')
                                },
                                ...(full && {
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        width: '80%',
                                        height: '1px',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        transform: 'rotate(-45deg)'
                                    }
                                })
                            }}
                        >
                            {day}
                        </Box>
                    );
                })}
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D4AF37' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.6 }}>Selected</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', position: 'relative', '&::after': { content: '""', position: 'absolute', width: '100%', height: '1px', bgcolor: 'rgba(255,255,255,0.4)', transform: 'rotate(-45deg)', top: '50%' } }} />
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.6 }}>Full</Typography>
                </Box>
            </Stack>
        </Box>
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
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight="500">{booking.service_type}</Typography>
                            {booking.status?.toLowerCase() === 'cancelled' && <Chip label="Cancelled" size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }} />}
                            {booking.status?.toLowerCase() === 'declined' && <Chip label="Declined" size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }} />}
                            {booking.status?.toLowerCase() === 'confirmed' && <Chip label="Confirmed" size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }} />}
                        </Stack>
                        <Stack spacing={0.5} mt={0.5}>
                            <Typography variant="caption" color="text.secondary">{booking.start_date}</Typography>
                            {booking.processed_by && (
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                                    {booking.status?.toLowerCase() === 'cancelled' || booking.status?.toLowerCase() === 'declined' ? 'Cancelled by' : 'Processed by'}: {booking.processed_by.split('@')[0]}
                                </Typography>
                            )}
                            {booking.status_note && (
                                <Typography variant="caption" sx={{ color: '#ffb74d', fontStyle: 'italic', display: 'block' }}>
                                    &quot;{booking.status_note}&quot;
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Box>
                <Typography variant="caption" fontWeight="bold">${booking.total_price.toFixed(2)}</Typography>
            </Stack>
        </Paper>
    );
}
