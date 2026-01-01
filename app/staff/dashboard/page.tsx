"use client";

import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Button,
    Stack,
    Container,
    Tooltip,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
    Switch,
    Badge as MuiBadge,
} from "@mui/material";
import Image from "next/image";
import {
    Restaurant,
    DirectionsWalk,
    Medication,
    Warning,
    Add,
    Store,
    Dashboard,
    TrendingUp,
    Security,
    People,
    PersonAdd,
    AttachMoney,
    Visibility,
    VisibilityOff,
    Settings,
    Face,
    CheckCircle,
    Cancel,
    Message as MessageIcon,
    Assignment as AssignmentIcon,
    Badge,
    Send,
    CrisisAlert,
    Error as ErrorIcon,
    History,
    Chat as ChatIcon,
    Fingerprint,
    BugReport,
    Favorite,
    ContentCut,
    AddAPhoto
} from "@mui/icons-material";
import BusinessDashboard from './components/BusinessDashboard';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
// ...
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL, authenticatedFetch } from '@/lib/api';
import BookingRequestManager from './components/BookingRequestManager';
import OperationsStats from './components/OperationsStats';
import ServiceManager from './components/ServiceManager';
import GuestList from './components/GuestList';
import ClientDirectory from './components/ClientDirectory';
import { GuestPet, UserWithPets, GroupedBookingRequest, EnrichedBooking, Message, User, Pet, Booking, Incident } from '@/types';

export default function StaffDashboard() {
    const [guests, setGuests] = useState<GuestPet[]>([]);
    const [loadingGuests, setLoadingGuests] = useState(true);
    const [viewMode, setViewMode] = useState<'operations' | 'financials' | 'team' | 'requests' | 'directory' | 'comms'>('operations');
    const [isOwner, setIsOwner] = useState(false);
    const [message, setMessage] = useState({ text: "", severity: "info" as any, open: false });

    // States for Staff 2.0 & Phase 10
    const [pendingBookings, setPendingBookings] = useState<GroupedBookingRequest[]>([]);
    const [recentBookings, setRecentBookings] = useState<GroupedBookingRequest[]>([]);
    const [todaysArrivals, setTodaysArrivals] = useState<EnrichedBooking[]>([]);
    const [allBookings, setAllBookings] = useState<EnrichedBooking[]>([]);
    const [clients, setClients] = useState<UserWithPets[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false);
    const [stats, setStats] = useState([
        { label: "Guests In House", value: "0", color: "primary.main" },
        { label: "Check-Ins Today", value: "0", color: "text.primary" },
        { label: "Departures", value: "0", color: "text.secondary" }
    ]);

    // Optimized sorting for Directory: Unread messages first, then pet owners, then alphabetical
    const sortedDirectoryClients = useMemo(() => {
        return [...clients].sort((a, b) => {
            // 1. Unread messages first
            const unreadA = a.unread_messages_count || 0;
            const unreadB = b.unread_messages_count || 0;
            if (unreadB !== unreadA) return unreadB - unreadA;

            // 2. Pet owners first
            const petsA = a.pets?.length || 0;
            const petsB = b.pets?.length || 0;
            if (petsA > 0 && petsB === 0) return -1;
            if (petsA === 0 && petsB > 0) return 1;

            // 3. Alphabetical
            const nameA = a.name || a.email || "";
            const nameB = b.name || b.email || "";
            return nameA.localeCompare(nameB);
        });
    }, [clients]);

    // Optimized sorting for Comms
    const sortedCommsClients = useMemo(() => {
        return [...clients].sort((a, b) => {
            if (a.unread_messages_count > 0 && b.unread_messages_count === 0) return -1;
            if (a.unread_messages_count === 0 && b.unread_messages_count > 0) return 1;

            if (a.oldest_unread_timestamp && b.oldest_unread_timestamp) {
                return a.oldest_unread_timestamp.localeCompare(b.oldest_unread_timestamp);
            }
            if (a.oldest_unread_timestamp) return -1;
            if (b.oldest_unread_timestamp) return 1;
            return 0;
        });
    }, [clients]);

    // Detail & Modal States
    const [selectedClient, setSelectedClient] = useState<UserWithPets | null>(null);
    const [showPetModal, setShowPetModal] = useState(false);
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState<Pet | GuestPet | null>(null);
    const [incidentText, setIncidentText] = useState("");
    const [incidentSeverity, setIncidentSeverity] = useState("Warning");
    const [incidentTargetId, setIncidentTargetId] = useState<string>("general");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [incidentHistory, setIncidentHistory] = useState<Incident[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Messaging States
    const [activeChat, setActiveChat] = useState<UserWithPets | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [sendingMsg, setSendingMsg] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    // Staff Management State
    const [openAddStaff, setOpenAddStaff] = useState(false);
    const [staffList, setStaffList] = useState<User[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    // Business Pricing State
    const [services, setServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [priceEdits, setPriceEdits] = useState<{ [key: string]: string }>({});
    const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "", role: "staff" });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState({
        booking_id: "",
        mood: "Happy",
        activity: "Playing",
        notes: "",
        ate_breakfast: "Yes",
        ate_dinner: "Pending",
        playtime_status: "Energetic",
        image_url: ""
    });
    const [submittingReport, setSubmittingReport] = useState(false);
    const [uploading, setUploading] = useState(false);

    const groupBookings = useCallback((bookings: EnrichedBooking[]): GroupedBookingRequest[] => {
        return Object.values(bookings.reduce((acc: any, booking: EnrichedBooking) => {
            const groupKey = `${booking.user_email}_${booking.start_date}_${booking.end_date}`;
            if (!acc[groupKey]) {
                acc[groupKey] = {
                    id: groupKey,
                    owner_name: booking.owner_name || booking.user_email,
                    owner_email: booking.user_email,
                    start_date: booking.start_date,
                    end_date: booking.end_date,
                    bookings: []
                };
            }
            acc[groupKey].bookings.push(booking);
            return acc;
        }, {}));
    }, []);

    const fetchGuests = useCallback(async () => {
        // Now handled by fetchPendingBookings via 'Checked In' status mapping.
        // Keeping empty or redundant to avoid breaking dependency arrays.
    }, []);

    const fetchPendingBookings = useCallback(async () => {
        setLoadingBookings(true);
        try {
            // Use staff endpoint to see ALL pending bookings
            const res = await authenticatedFetch(`${API_BASE_URL}/api/staff/bookings`);

            if (res.ok) {
                const data = await res.json();
                setAllBookings(data);

                // 1. Separate Pending vs Confirmed
                const pending = data.filter((b: any) => b.status?.toLowerCase() === 'pending');
                const confirmed = data.filter((b: any) => b.status?.toLowerCase() === 'confirmed');

                // 2. Set Pending Groups
                setPendingBookings(groupBookings(pending));

                // 3. Set Recent Groups (Last 5)
                const groupedConfirmed = groupBookings(confirmed);
                setRecentBookings(groupedConfirmed.slice(0, 5));

                // 4. Set Today's Arrivals (Confirmed only)
                const today = new Date();
                const todayStr = today.toDateString();
                const arrivals = confirmed.filter((b: any) => new Date(b.start_date + 'T00:00:00').toDateString() === todayStr);
                setTodaysArrivals(arrivals);

                // 5. Calculate Real Stats
                const guestsInHouse = confirmed.filter((b: any) => {
                    const start = new Date(b.start_date + 'T00:00:00');
                    const end = new Date(b.end_date + 'T00:00:00');
                    // Normalize today to avoid time issues
                    const todayDate = new Date(todayStr);
                    return start <= todayDate && end >= todayDate;
                }).length;

                const departures = confirmed.filter((b: any) => new Date(b.end_date + 'T00:00:00').toDateString() === todayStr).length;

                setStats([
                    { label: "Guests In House", value: guestsInHouse.toString(), color: "primary.main" },
                    { label: "Check-Ins Today", value: arrivals.length.toString(), color: "text.primary" },
                    { label: "Departures", value: departures.toString(), color: "text.secondary" }
                ]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBookings(false);
        }
    }, [groupBookings]);

    // Replacement for fetchPendingBookings to handle Guest List Sync properly
    const fetchDashboardData = useCallback(async () => {
        setLoadingBookings(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/staff/bookings`);
            if (res.ok) {
                const data = await res.json();
                setAllBookings(data);

                // 1. Separate Statuses
                const pending = data.filter((b: any) => b.status?.toLowerCase() === 'pending');
                const confirmed = data.filter((b: any) => b.status?.toLowerCase() === 'confirmed');
                const checkedIn = data.filter((b: any) => b.status?.toLowerCase() === 'checked in');

                // 2. Set Pending Groups
                setPendingBookings(groupBookings(pending));

                // 3. Set Recent Groups
                const groupedConfirmed = groupBookings(confirmed);
                setRecentBookings(groupedConfirmed.slice(0, 5));

                // 4. Set Today's Arrivals
                const today = new Date();
                const todayStr = today.toDateString();
                const arrivals = confirmed.filter((b: any) => {
                    const start = new Date(b.start_date + 'T00:00:00').toDateString();
                    return (b.status === 'Confirmed' || b.status === 'Checked In') && start === todayStr;
                });
                setTodaysArrivals(arrivals);

                // 5. Calculate Real Stats
                const guestsInHouseCount = checkedIn.length;
                const departures = checkedIn.filter((b: any) => new Date(b.end_date + 'T00:00:00').toDateString() === todayStr).length;

                setStats([
                    { label: "Guests In House", value: guestsInHouseCount.toString(), color: "primary.main" },
                    { label: "Check-Ins Today", value: arrivals.length.toString(), color: "text.primary" },
                    { label: "Departures", value: departures.toString(), color: "text.secondary" }
                ]);

                // 6. Sync Guest List
                const mappedGuests: GuestPet[] = checkedIn.map((b: any) => ({
                    id: b.dog_id,
                    name: b.dog_name || 'Guest',
                    breed: 'Unknown',
                    status: 'Active',
                    alerts: b.notes ? [b.notes] : [],
                    fed: false,
                    walked: false,
                    meds: null,
                    img: `https://placedog.net/400/300?id=${b.dog_id.charCodeAt(0)}`
                }));
                setGuests(mappedGuests);
                setLoadingGuests(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBookings(false);
        }
    }, [groupBookings]);

    const fetchClients = useCallback(async () => {
        setLoadingClients(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/staff/clients`);
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingClients(false);
        }
    }, []);

    const fetchStaff = useCallback(async () => {
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/staff`);
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (e) {
            console.error("Failed to fetch staff", e);
        }
    }, []);

    const fetchMessages = useCallback(async (targetEmail: string) => {
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/messages?email=${encodeURIComponent(targetEmail)}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                markAsRead(targetEmail);
            }
        } catch (e) {
            console.error("Chat sync failed", e);
        }
    }, []);

    const fetchServices = useCallback(async () => {
        setLoadingServices(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/services`);
            if (res.ok) setServices(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingServices(false);
        }
    }, []);

    const handleUpdatePrice = async (id: string, newPrice: number) => {
        const previousServices = [...services];

        try {
            // Optimistic Update: Update UI immediately
            setServices(prev => prev.map(s => s.id === id ? { ...s, price: newPrice } : s));
            setPriceEdits(prev => { const n = { ...prev }; delete n[id]; return n; });

            const res = await authenticatedFetch(`${API_BASE_URL}/api/services/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ price: newPrice })
            });

            if (res.ok) {
                setMessage({ text: "Price updated successfully", severity: "success", open: true });
            } else {
                throw new Error("Update failed");
            }
        } catch (e) {
            console.error(e);
            // Rollback on failure
            setServices(previousServices);
            setMessage({ text: "Failed to update price", severity: "error", open: true });
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('vanguard_role');
        if (role === 'owner') {
            setIsOwner(true);
            fetchStaff();
            fetchServices();
        }
        // Always fetch pets for the Ops view
        fetchGuests();
        fetchDashboardData();
        fetchClients();
    }, [fetchGuests, fetchDashboardData, fetchClients, fetchStaff, fetchServices]);

    // Periodic Refresh (Auto-Polling)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchClients();
            fetchDashboardData(); // Poll for new requests
            if (viewMode === 'comms' && activeChat) {
                fetchMessages(activeChat.email);
            }
        }, 10000); // 10s sync
        return () => clearInterval(interval);
    }, [viewMode, activeChat, fetchClients, fetchMessages, fetchDashboardData]);

    const markAsRead = async (email: string) => {
        try {
            await authenticatedFetch(`${API_BASE_URL}/api/messages/read`, {
                method: 'PUT',
                body: JSON.stringify({ sender_email: email })
            });
            setClients(prev => prev.map(c => c.email === email ? { ...c, unread_messages_count: 0 } : c));
        } catch (e) {
            console.error("Read mark failed", e);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChat) return;
        setSendingMsg(true);
        try {
            const senderEmail = localStorage.getItem('vanguard_email');
            await authenticatedFetch(`${API_BASE_URL}/api/messages`, {
                method: 'POST',
                body: JSON.stringify({
                    sender: senderEmail,
                    receiver: activeChat.email,
                    content: newMessage
                })
            });
            setNewMessage("");
            fetchMessages(activeChat.email);
        } catch (e) {
            console.error("Send failed", e);
        } finally {
            setSendingMsg(false);
        }
    };

    const handleLogIncident = async () => {
        if (!incidentText.trim()) return;
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/incidents`, {
                method: 'POST',
                body: JSON.stringify({
                    id: Math.random().toString(36).substr(2, 9),
                    booking_id: "ops_log",
                    pet_id: selectedPet?.id || incidentTargetId,
                    content: incidentText,
                    severity: incidentSeverity
                })
            });

            if (res.ok) {
                setMessage({ text: "Alert logged successfully!", severity: "success", open: true });
                setShowIncidentModal(false);
                setIncidentText("");
                fetchGuests();
            } else {
                setMessage({ text: "Failed to log alert. Please try again.", severity: "error", open: true });
            }
        } catch (e) {
            console.error("Incident log failed", e);
        }
    };

    const handleBookingAction = async (id: string, action: 'confirmed' | 'cancelled' | 'declined') => {
        const verb = action === 'confirmed' ? 'Accept' : (action === 'declined' ? 'Decline' : 'Cancel');
        const note = prompt(`Optional: Enter a reason/note for this ${verb} action:`);

        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: action, note: note || undefined })
            });

            if (res.ok) {
                setMessage({ text: `Booking ${action} successfully!`, severity: "success", open: true });
                fetchDashboardData();
                fetchGuests();
            } else {
                setMessage({ text: `Update failed`, severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Failed to update booking", severity: "error", open: true });
        }
    };

    const handleBatchAction = async (bookings: EnrichedBooking[] | GroupedBookingRequest['bookings'], action: 'confirmed' | 'declined' | 'cancelled') => {
        const verb = action === 'confirmed' ? 'Accept' : (action === 'declined' ? 'Decline' : 'Cancel');
        const note = prompt(`Optional: Enter a bulk reason/note for ${verb}ing ${bookings.length} requests:`);

        if (!confirm(`Confirm ${verb} all ${bookings.length} requests?`)) return;

        setLoadingBookings(true);
        const errors: string[] = [];

        try {
            await Promise.all(bookings.map(async (b) => {
                try {
                    const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${b.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ status: action, note: note || undefined })
                    });
                    if (!res.ok) errors.push(b.dog_name || "Unknown");
                } catch (e) {
                    errors.push(b.dog_name || "Unknown");
                }
            }));

            if (errors.length > 0) {
                setMessage({ text: `Batch action completed with errors for: ${errors.join(', ')}`, severity: "warning", open: true });
            } else {
                setMessage({ text: `All ${bookings.length} bookings ${action} successfully!`, severity: "success", open: true });
            }
        } catch (e) {
            console.error("Batch failed", e);
            setMessage({ text: "Critical batch error", severity: "error", open: true });
        } finally {
            fetchDashboardData();
            fetchGuests();
        }
    };

    const handleDeleteStaff = async (email: string) => {
        if (!confirm(`Are you sure you want to terminate ${email}?`)) return;
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/staff/${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setMessage({ text: "Staff member removed", severity: "info", open: true });
                fetchStaff();
            }
        } catch (e) {
            setMessage({ text: "Failed to delete staff", severity: "error", open: true });
        }
    };

    const handleAddStaff = async () => {
        setFormError("");
        setFormSuccess("");
        setLoadingStaff(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                body: JSON.stringify(newStaff)
            });
            if (res.ok) {
                setFormSuccess("Employee added successfully!");
                setNewStaff({ name: "", email: "", password: "", role: "staff" });
                fetchStaff();
                setTimeout(() => setOpenAddStaff(false), 1500);
            } else {
                setFormError("Failed to add employee");
            }
        } catch (e: any) {
            setFormError(`Failed to add employee: ${e.message}`);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleCheckIn = async (booking: EnrichedBooking) => {
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${booking.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'Checked In' })
            });

            if (res.ok) {
                setMessage({ text: `${booking.dog_name || 'VIP'} checked in successfully!`, severity: "success", open: true });
                setShowCheckInModal(false);
                fetchGuests();
                fetchDashboardData();
            } else {
                setMessage({ text: "Check-in failed", severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Check-in failed", severity: "error", open: true });
        }
    };

    const toggleAction = (id: string, action: 'fed' | 'walked' | 'meds') => {
        setGuests(guests.map(g => {
            if (g.id === id) {
                return { ...g, [action]: !g[action] };
            }
            return g;
        }));
    };

    const handleCheckOut = async (guest: GuestPet) => {
        const booking = allBookings.find((b: any) => b.dog_id === guest.id && b.status === 'Checked In');
        if (!booking) return;

        if (!confirm(`Check out ${guest.name}?`)) return;

        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${booking.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'Completed' })
            });
            if (res.ok) {
                setMessage({ text: `${guest.name} checked out!`, severity: "success", open: true });
                fetchDashboardData();
            }
        } catch (e) {
            setMessage({ text: "Checkout failed", severity: "error", open: true });
        }
    };

    const handleOpenReport = async (pet: GuestPet) => {
        // find active booking for this pet
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/staff/bookings`);
            if (res.ok) {
                const bookings = await res.json();
                const active = bookings.find((b: any) =>
                    b.dog_id === pet.id &&
                    b.status.toLowerCase() === 'confirmed'
                );

                if (active) {
                    setReportData(prev => ({ ...prev, booking_id: active.id }));
                    setSelectedPet(pet);
                    setShowReportModal(true);
                } else {
                    setMessage({ text: "No active confirmed booking found for this pet.", severity: "warning", open: true });
                }
            }
        } catch (e) {
            console.error("Failed to find booking", e);
        }
    };

    const handleViewHistory = async (pet: GuestPet) => {
        setSelectedPet(pet);
        setHistoryLoading(true);
        setShowHistoryModal(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/incidents/${pet.id}`);
            if (res.ok) {
                setIncidentHistory(await res.json());
            } else {
                setIncidentHistory([]);
            }
        } catch (e) {
            console.error("Failed to fetch history", e);
            setMessage({ text: "Failed to load history", severity: "error", open: true });
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('vanguard_token');
            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type not set, let browser set boundary for multipart
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setReportData({ ...reportData, image_url: data.url });
                setMessage({ text: "Photo uploaded successfully!", severity: "success", open: true });
            } else {
                setMessage({ text: "Upload failed", severity: "error", open: true });
            }
        } catch (error) {
            console.error("Upload error:", error);
            setMessage({ text: "Upload error", severity: "error", open: true });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitReport = async () => {
        setSubmittingReport(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/reports`, {
                method: 'POST',
                body: JSON.stringify(reportData)
            });
            if (res.ok) {
                setMessage({ text: "Daily Report pushed to client! 🐾", severity: "success", open: true });
                setShowReportModal(false);
                setReportData({
                    booking_id: "",
                    mood: "Happy",
                    activity: "Playing",
                    notes: "",
                    ate_breakfast: "Yes",
                    ate_dinner: "Pending",
                    playtime_status: "Energetic",
                    image_url: ""
                });
            } else {
                setMessage({ text: "Failed to post report", severity: "error", open: true });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmittingReport(false);
        }
    };

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="xl">

                {/* Header Actions */}
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={3}
                    sx={{ mb: 4 }}
                >
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={1}>
                                {viewMode === 'operations' ? "TUESDAY, DEC 30" : "COMMAND CENTER"}
                            </Typography>
                            {isOwner && (
                                <Chip
                                    label="OWNER ACCESS"
                                    size="small"
                                    sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.6rem', height: 20 }}
                                />
                            )}
                        </Stack>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            {viewMode === 'operations' ? "Daily Run" : viewMode === 'financials' ? "Financial Overview" : viewMode === 'team' ? "Team Command" : "Dashboard"}
                        </Typography>
                    </Box>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 0.5, borderRadius: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                            <Button
                                variant={viewMode === 'operations' ? 'contained' : 'text'}
                                onClick={() => setViewMode('operations')}
                                startIcon={<Store />}
                                sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'operations' ? 'black' : 'text.secondary', bgcolor: viewMode === 'operations' ? 'white' : 'transparent', '&:hover': { bgcolor: viewMode === 'operations' ? 'white' : 'rgba(255,255,255,0.05)' } }}
                            >
                                Ops
                            </Button>
                            <Button
                                variant={viewMode === 'requests' ? 'contained' : 'text'}
                                onClick={() => setViewMode('requests')}
                                startIcon={<AssignmentIcon />}
                                sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'requests' ? 'black' : 'text.secondary', bgcolor: viewMode === 'requests' ? '#3b82f6' : 'transparent', '&:hover': { bgcolor: viewMode === 'requests' ? '#3b82f6' : 'rgba(255,255,255,0.05)' } }}
                            >
                                Requests {pendingBookings.length > 0 && `(${pendingBookings.length})`}
                            </Button>
                            <Button
                                variant={viewMode === 'directory' ? 'contained' : 'text'}
                                onClick={() => setViewMode('directory')}
                                startIcon={<People />}
                                sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'directory' ? 'black' : 'text.secondary', bgcolor: viewMode === 'directory' ? 'white' : 'transparent', '&:hover': { bgcolor: viewMode === 'directory' ? 'white' : 'rgba(255,255,255,0.05)' } }}
                            >
                                Clients
                            </Button>
                            <Button
                                variant={viewMode === 'comms' ? 'contained' : 'text'}
                                onClick={() => setViewMode('comms')}
                                startIcon={<ChatIcon />}
                                sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'comms' ? 'black' : 'text.secondary', bgcolor: viewMode === 'comms' ? '#D4AF37' : 'transparent', '&:hover': { bgcolor: viewMode === 'comms' ? '#D4AF37' : 'rgba(255,255,255,0.05)' } }}
                            >
                                Comms
                            </Button>
                            {isOwner && (
                                <>
                                    <Button
                                        variant={viewMode === 'financials' ? 'contained' : 'text'}
                                        onClick={() => setViewMode('financials')}
                                        startIcon={<AttachMoney />}
                                        sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'financials' ? 'black' : 'text.secondary', bgcolor: viewMode === 'financials' ? '#D4AF37' : 'transparent', '&:hover': { bgcolor: viewMode === 'financials' ? '#D4AF37' : 'rgba(255,255,255,0.05)' } }}
                                    >
                                        Financials
                                    </Button>
                                    <Button
                                        variant={viewMode === 'team' ? 'contained' : 'text'}
                                        onClick={() => setViewMode('team')}
                                        startIcon={<Security />}
                                        sx={{ borderRadius: 2.5, px: 2, fontSize: '0.8rem', color: viewMode === 'team' ? 'black' : 'text.secondary', bgcolor: viewMode === 'team' ? '#D4AF37' : 'transparent', '&:hover': { bgcolor: viewMode === 'team' ? '#D4AF37' : 'rgba(255,255,255,0.05)' } }}
                                    >
                                        Team
                                    </Button>
                                </>
                            )}
                            <IconButton onClick={() => setShowSettingsDialog(true)} sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'white' } }}>
                                <Settings />
                            </IconButton>
                        </Box>

                        {viewMode === 'operations' && (
                            <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setShowCheckInModal(true)}
                                    sx={{ flex: { xs: 1, sm: 'none' } }}
                                >
                                    Check-In
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Stack>

                {/* --- OPERATIONS VIEW --- */}
                {viewMode === 'operations' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <OperationsStats stats={stats} />
                        <GuestList
                            guests={guests}
                            loading={loadingGuests}
                            onToggleAction={toggleAction}
                            onLogIncident={(pet) => { setSelectedPet(pet); setShowIncidentModal(true); }}
                            onPostReport={handleOpenReport}
                            onViewHistory={handleViewHistory}
                            onCheckOut={handleCheckOut}
                            onGuestClick={(guest: GuestPet) => {
                                const booking = allBookings.find(b => b.dog_id === guest.id);
                                if (booking) {
                                    const client = clients.find(c => c.email === booking.user_email);
                                    if (client) {
                                        setSelectedClient(client);
                                        setShowPetModal(true);
                                    }
                                }
                            }}
                        />
                    </motion.div>
                )}



                {/* --- FINANCIAL OVERVIEW --- */}
                {viewMode === 'financials' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Stack spacing={3}>
                            <BusinessDashboard bookings={allBookings} />

                            {isOwner && (
                                <Box sx={{ mt: 2 }}>
                                    <ServiceManager
                                        services={services}
                                        loading={loadingServices}
                                        onUpdatePrice={handleUpdatePrice}
                                    />
                                </Box>
                            )}
                        </Stack>
                    </motion.div>
                )}

                {/* --- TEAM COMMAND --- */}
                {viewMode === 'team' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            <Box sx={{ flex: { xs: '1 1 auto', md: 2 } }}>
                                <Stack spacing={3}>
                                    {/* Staff Management */}
                                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Security sx={{ color: 'text.secondary' }} />
                                                <Typography variant="h6" fontWeight="bold">My Team</Typography>
                                            </Stack>
                                            <Button startIcon={<PersonAdd />} size="small" variant="contained" onClick={() => setOpenAddStaff(true)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                                Add Staff
                                            </Button>
                                        </Stack>

                                        <Stack spacing={2}>
                                            {staffList.length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" textAlign="center">No staff found.</Typography>
                                            ) : (
                                                staffList.map((staff, i) => (
                                                    <Stack key={i} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: staff.role === 'owner' ? '#F59E0B' : '#3B82F6', fontSize: 12, fontWeight: 'bold' }}>{staff.name[0]}</Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="bold">{staff.name}</Typography>
                                                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{staff.role}</Typography>
                                                            </Box>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Chip label="Active" size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }} />
                                                            {isOwner && staff.role !== 'owner' && (
                                                                <IconButton size="small" color="error" onClick={() => handleDeleteStaff(staff.email)}>
                                                                    <Cancel sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                ))
                                            )}
                                        </Stack>
                                    </Paper>
                                </Stack>
                            </Box>

                            <Box sx={{ flex: { xs: '1 1 auto', md: 1 } }}>
                                <Stack spacing={3}>
                                    {/* Security Alerts */}
                                    <Paper
                                        onClick={() => window.location.href = '/staff/audit'}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            bgcolor: 'rgba(239, 68, 68, 0.05)',
                                            border: '1px solid rgba(239, 68, 68, 0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Warning color="error" />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold" color="error">System Alert</Typography>
                                                <Typography variant="caption" color="text.secondary">3 failed login attempts blocked from IP 192.168.1.45</Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>

                                    {/* Global Comms Shortcut */}
                                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                            <MessageIcon sx={{ color: 'text.secondary' }} />
                                            <Typography variant="h6" fontWeight="bold">Global Comms</Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                            View, filter, and audit all client-staff communication logs.
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => window.location.href = '/staff/comms'}
                                            sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.primary', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
                                        >
                                            Open Black Box
                                        </Button>
                                    </Paper>
                                </Stack>
                            </Box>
                        </Stack>
                    </motion.div>
                )}

                {/* --- BOOKING REQUESTS VIEW --- */}
                {viewMode === 'requests' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
                        <BookingRequestManager
                            pendingBookings={pendingBookings}
                            recentBookings={recentBookings}
                            loading={loadingBookings}
                            onAction={handleBatchAction}
                            onChat={(email) => {
                                const client = clients.find(c => c.email === email);
                                if (client) {
                                    setActiveChat(client);
                                    setViewMode('comms');
                                }
                            }}
                        />
                    </motion.div>
                )}

                {/* --- CLIENT DIRECTORY VIEW --- */}
                {viewMode === 'directory' && (
                    <ClientDirectory
                        clients={sortedDirectoryClients}
                        onViewPets={(c) => {
                            setSelectedClient(c);
                            setShowPetModal(true);
                        }}
                        onChat={(c) => {
                            setActiveChat(c);
                            setViewMode('comms');
                            fetchMessages(c.email);
                        }}
                    />
                )}


                {/* --- COMMS VIEW --- */}
                {viewMode === 'comms' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Box sx={{ height: '70vh', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                            {/* Conversations List */}
                            <Box sx={{ width: { xs: '100%', md: '33.33%' }, borderRight: '1px solid rgba(255,255,255,0.05)', display: { xs: activeChat ? 'none' : 'block', md: 'block' } }}>
                                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                                    <Typography variant="subtitle2" color="#94a3b8">Active Threads</Typography>
                                </Box>
                                <Box sx={{ overflowY: 'auto', height: 'calc(70vh - 51px)' }}>
                                    {sortedCommsClients.map((client, idx) => (
                                        <Box
                                            key={idx}
                                            onClick={() => { setActiveChat(client); fetchMessages(client.email); }}
                                            sx={{
                                                p: 2,
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(255,255,255,0.02)',
                                                bgcolor: activeChat?.email === client.email ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <MuiBadge badgeContent={client.unread_messages_count} color="error" invisible={!client.unread_messages_count}>
                                                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.05)' }}>{client.email[0].toUpperCase()}</Avatar>
                                                </MuiBadge>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" fontWeight="bold" noWrap color="white">{client.name || client.email}</Typography>
                                                    <Typography variant="caption" color="#64748b" noWrap display="block">
                                                        {client.pets?.[0]?.name || 'Client'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Chat Window */}
                            <Box sx={{ width: { xs: '100%', md: '66.67%' }, height: '100%', display: { xs: activeChat ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column' }}>
                                {activeChat ? (
                                    <>
                                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <IconButton size="small" sx={{ display: { md: 'none' }, color: 'white' }} onClick={() => setActiveChat(null)}>
                                                    <Cancel />
                                                </IconButton>
                                                <Typography variant="subtitle1" fontWeight="bold" color="#D4AF37">{activeChat.email}</Typography>
                                            </Stack>
                                            <MessageIcon sx={{ color: '#D4AF37', opacity: 0.5 }} />
                                        </Box>

                                        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {messages.map((msg, i) => {
                                                const isStaff = msg.sender_email === localStorage.getItem('vanguard_email');
                                                return (
                                                    <Box key={i} sx={{ alignSelf: isStaff ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                                        <Paper sx={{
                                                            p: 2,
                                                            borderRadius: 3,
                                                            bgcolor: isStaff ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                                                            color: isStaff ? 'black' : 'white',
                                                            boxShadow: isStaff ? '0 4px 20px rgba(212,175,55,0.2)' : 'none'
                                                        }}>
                                                            <Typography variant="body2">{msg.content}</Typography>
                                                        </Paper>
                                                        <Typography variant="caption" color="#64748b" sx={{ mt: 0.5, display: 'block', textAlign: isStaff ? 'right' : 'left' }}>
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })}
                                            <div ref={scrollRef} />
                                        </Box>

                                        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Stack direction="row" spacing={1}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Type a secure response..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3 }
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={handleSendMessage}
                                                    disabled={sendingMsg || !newMessage.trim()}
                                                    sx={{ bgcolor: '#D4AF37', color: 'black', '&:hover': { bgcolor: '#F5D061' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.1)' } }}
                                                >
                                                    {sendingMsg ? <CircularProgress size={20} color="inherit" /> : <Send fontSize="small" />}
                                                </IconButton>
                                            </Stack>
                                        </Box>
                                    </>
                                ) : (
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                        <MessageIcon sx={{ fontSize: 64, mb: 2 }} />
                                        <Typography>Secure Comms Channel</Typography>
                                        <Typography variant="caption">Select a thread to begin</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </motion.div>
                )}

                {/* --- PET DETAIL MODAL --- */}
                <Dialog open={showPetModal} onClose={() => setShowPetModal(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="h6" color="#D4AF37" fontWeight="bold">VIP Profile & Records</Typography>
                        <Chip label="Secure View" size="small" variant="outlined" sx={{ borderColor: '#D4AF37', color: '#D4AF37' }} />
                    </DialogTitle>
                    <DialogContent sx={{ bgcolor: '#1a1a1a', pt: 3 }}>
                        {selectedClient?.pets?.map((pet: any, i: number) => (
                            <Box key={i} sx={{ mb: 4 }}>
                                <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                                    <Avatar src={pet.image_url || pet.photo_url} sx={{ width: 80, height: 80, border: '2px solid #D4AF37' }} />
                                    <Box>
                                        <Typography variant="h5" color="white" fontWeight="bold">{pet.name}</Typography>
                                        <Typography color="#D4AF37">{pet.breed}</Typography>
                                        <Typography variant="caption" color="#64748b">ID: {pet.id}</Typography>
                                    </Box>
                                </Stack>

                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Box>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                                            <Typography variant="caption" color="#64748b" display="block">Age</Typography>
                                            <Typography color="white">{pet.age} Years</Typography>
                                        </Paper>
                                    </Box>
                                    <Box>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                                            <Typography variant="caption" color="#64748b" display="block">Weight</Typography>
                                            <Typography color="white">{pet.weight} lbs</Typography>
                                        </Paper>
                                    </Box>
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                                            <Typography variant="caption" color="#64748b" display="block">Temperament</Typography>
                                            <Typography color="white">{pet.temperament}</Typography>
                                        </Paper>
                                    </Box>
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                                            <Typography variant="caption" color="#64748b" display="block" mb={1}>Care & Compliance Diagnostics</Typography>
                                            <Stack direction="row" spacing={3} justifyContent="space-around">
                                                <Tooltip title={pet.is_microchipped ? "Microchipped" : "Not Microchipped"}>
                                                    <Box sx={{ textAlign: 'center', opacity: pet.is_microchipped ? 1 : 0.2 }}>
                                                        <Fingerprint sx={{ fontSize: 20, color: pet.is_microchipped ? '#4ade80' : 'inherit' }} />
                                                        <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>CHIP</Typography>
                                                    </Box>
                                                </Tooltip>
                                                <Tooltip title={pet.spayed_neutered ? "Spayed/Neutered" : "Intact"}>
                                                    <Box sx={{ textAlign: 'center', opacity: pet.spayed_neutered ? 1 : 0.2 }}>
                                                        <ContentCut sx={{ fontSize: 20, color: pet.spayed_neutered ? '#4ade80' : 'inherit' }} />
                                                        <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>FIXED</Typography>
                                                    </Box>
                                                </Tooltip>
                                                <Tooltip title={pet.flea_tick_prevention ? "Flea/Tick Compliant" : "No Flea/Tick Prevention"}>
                                                    <Box sx={{ textAlign: 'center', opacity: pet.flea_tick_prevention ? 1 : 0.2 }}>
                                                        <BugReport sx={{ fontSize: 20, color: pet.flea_tick_prevention ? '#4ade80' : 'inherit' }} />
                                                        <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>FLEA</Typography>
                                                    </Box>
                                                </Tooltip>
                                                <Tooltip title={pet.heartworm_prevention ? "Heartworm Compliant" : "No Heartworm Prevention"}>
                                                    <Box sx={{ textAlign: 'center', opacity: pet.heartworm_prevention ? 1 : 0.2 }}>
                                                        <Favorite sx={{ fontSize: 20, color: pet.heartworm_prevention ? '#4ade80' : 'inherit' }} />
                                                        <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>HEART</Typography>
                                                    </Box>
                                                </Tooltip>
                                            </Stack>
                                        </Paper>
                                    </Box>
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(212, 175, 55, 0.05)', borderRadius: 2, border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                            <Typography variant="caption" color="primary" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>Feeding Protocol</Typography>
                                            <Typography color="white" fontWeight="bold">
                                                {pet.feeding_amount || 'Not Specified'} • {pet.feeding_frequency || 'As Needed'}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                                            <Typography variant="caption" color="#64748b" display="block">Medical Notes & Allergies</Typography>
                                            <Typography color="white">{pet.allergies || 'No known allergies'}</Typography>
                                        </Paper>
                                    </Box>
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="error"
                                            startIcon={<CrisisAlert />}
                                            onClick={() => { setSelectedPet(pet); setShowPetModal(false); setShowIncidentModal(true); }}
                                            sx={{ mt: 1, borderRadius: 2, bgcolor: '#ef4444' }}
                                        >
                                            Log Incident
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<History />}
                                            onClick={() => { setSelectedPet(pet); setShowPetModal(false); handleViewHistory(pet); }}
                                            sx={{ mt: 1, borderRadius: 2, borderColor: 'rgba(255,255,255,0.2)', color: 'text.secondary', '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}
                                        >
                                            View History
                                        </Button>
                                        {pet.vaccination_records && (
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<Visibility />}
                                                sx={{ mt: 1, borderRadius: 2, borderColor: '#D4AF37', color: '#D4AF37' }}
                                                onClick={() => {
                                                    const token = localStorage.getItem('vanguard_token');
                                                    fetch(`${API_BASE_URL}${pet.vaccination_records}`, {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    })
                                                        .then(res => res.blob())
                                                        .then(blob => {
                                                            const url = window.URL.createObjectURL(blob);
                                                            window.open(url);
                                                        });
                                                }}
                                            >
                                                View Vaccination Record
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                                {i < (selectedClient?.pets?.length || 0) - 1 && <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.05)' }} />}
                            </Box>
                        ))}
                    </DialogContent>
                    <DialogActions sx={{ p: 3, bgcolor: '#1a1a1a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Button onClick={() => setShowPetModal(false)} sx={{ color: '#64748b' }}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* --- INCIDENT LOG DIALOG --- */}
                <Dialog open={showIncidentModal} onClose={() => setShowIncidentModal(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ bgcolor: '#ef4444', color: 'white' }}>Log Care Alert: {selectedPet?.name || 'General Operation'}</DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                This will add a persistent alert to this VIP&apos;s operational card until resolved.
                            </Typography>

                            {!selectedPet && (
                                <FormControl fullWidth>
                                    <InputLabel>Target VIP</InputLabel>
                                    <Select
                                        value={incidentTargetId}
                                        onChange={(e) => setIncidentTargetId(e.target.value)}
                                        label="Target VIP"
                                    >
                                        <MenuItem value="general">General Operation (No Specific VIP)</MenuItem>
                                        {guests.map(g => (
                                            <MenuItem key={g.id} value={g.id}>{g.name} ({g.breed})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            <FormControl fullWidth>
                                <InputLabel>Severity</InputLabel>
                                <Select
                                    value={incidentSeverity}
                                    onChange={(e) => setIncidentSeverity(e.target.value)}
                                    label="Severity"
                                >
                                    <MenuItem value="Warning">Yellow Alert (Observation)</MenuItem>
                                    <MenuItem value="Critical">Red Alert (Emergency/Strict)</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Details"
                                multiline
                                rows={3}
                                fullWidth
                                value={incidentText}
                                onChange={(e) => setIncidentText(e.target.value)}
                                placeholder="e.g. Buddy showed minor limping on front left paw..."
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setShowIncidentModal(false)}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleLogIncident} disabled={!incidentText.trim()}>Log Alert</Button>
                    </DialogActions>
                </Dialog>

                {/* --- CHECK-IN STATUS DIALOG --- */}
                <Dialog open={showCheckInModal} onClose={() => setShowCheckInModal(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Arrivals Terminal: {new Date().toLocaleDateString()}</DialogTitle>
                    <DialogContent>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Listing confirmed bookings for today only.
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            {todaysArrivals.length === 0 ? (
                                <Alert severity="info">No arrivals scheduled for today.</Alert>
                            ) : todaysArrivals.map((arrival, i) => (
                                <Paper key={i} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: '#3b82f6' }}>{arrival.user_email[0].toUpperCase()}</Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{arrival.dog_name || 'Dog'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{arrival.service_type}</Typography>
                                        </Box>
                                    </Stack>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleCheckIn(arrival)}
                                        sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
                                    >
                                        Check In
                                    </Button>
                                </Paper>
                            ))}
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setShowCheckInModal(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Add Staff Modal */}
                <Dialog open={openAddStaff} onClose={() => setOpenAddStaff(false)} PaperProps={{ sx: { bgcolor: '#1e293b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
                    <DialogTitle sx={{ color: 'white' }}>Add New Team Member</DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1, minWidth: 300 }}>
                            {formError && <Alert severity="error">{formError}</Alert>}
                            {formSuccess && <Alert severity="success">{formSuccess}</Alert>}

                            <TextField
                                label="Full Name"
                                fullWidth
                                value={newStaff.name}
                                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                            />
                            <TextField
                                label="Email Address"
                                fullWidth
                                value={newStaff.email}
                                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={newStaff.role}
                                    label="Role"
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                >
                                    <MenuItem value="staff">Staff (Operational)</MenuItem>
                                    <MenuItem value="owner">Owner (Admin Access)</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                value={newStaff.password}
                                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpenAddStaff(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddStaff}
                            disabled={loadingStaff}
                            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                        >
                            {loadingStaff ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Owner Settings Modal */}
                <Dialog
                    open={showSettingsDialog}
                    onClose={() => setShowSettingsDialog(false)}
                    PaperProps={{ sx: { bgcolor: '#1e293b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, minWidth: 350 } }}
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                        <Settings /> Command Settings
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                General system settings and profile management for the Operational Command.
                            </Typography>

                            {isOwner && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<AttachMoney />}
                                    onClick={() => { setViewMode('financials'); setShowSettingsDialog(false); }}
                                    sx={{ bgcolor: '#D4AF37', color: 'black', '&:hover': { bgcolor: '#b5932b' }, fontWeight: 'bold' }}
                                >
                                    Manage Rates & Pricing
                                </Button>
                            )}

                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                onClick={() => {
                                    localStorage.removeItem('vanguard_token');
                                    window.location.href = '/';
                                }}
                            >
                                Emergency Sign Out
                            </Button>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setShowSettingsDialog(false)} sx={{ color: 'text.secondary' }}>Close</Button>
                    </DialogActions>
                </Dialog>

            </Container>

            {/* Daily Report Dialog */}
            <Dialog
                open={showReportModal}
                onClose={() => setShowReportModal(false)}
                PaperProps={{ sx: { bgcolor: '#1e293b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, minWidth: 400 } }}
            >
                <DialogTitle sx={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon sx={{ color: '#D4AF37' }} /> Daily VIP Update: {selectedPet?.name}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                select
                                label="Mood"
                                fullWidth
                                variant="filled"
                                value={reportData.mood}
                                onChange={e => setReportData({ ...reportData, mood: e.target.value })}
                            >
                                <MenuItem value="Happy">Happy 😊</MenuItem>
                                <MenuItem value="Energetic">Energetic ⚡</MenuItem>
                                <MenuItem value="Relaxed">Relaxed 😴</MenuItem>
                                <MenuItem value="Shy">Shy 🥺</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="Activity"
                                fullWidth
                                variant="filled"
                                value={reportData.activity}
                                onChange={e => setReportData({ ...reportData, activity: e.target.value })}
                            >
                                <MenuItem value="Playing">Playing</MenuItem>
                                <MenuItem value="Walking">Walking</MenuItem>
                                <MenuItem value="Swimming">Swimming</MenuItem>
                                <MenuItem value="Resting">Resting</MenuItem>
                            </TextField>
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                select
                                label="Breakfast"
                                fullWidth
                                variant="filled"
                                value={reportData.ate_breakfast}
                                onChange={e => setReportData({ ...reportData, ate_breakfast: e.target.value })}
                            >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="Partial">Partial</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="Dinner"
                                fullWidth
                                variant="filled"
                                value={reportData.ate_dinner}
                                onChange={e => setReportData({ ...reportData, ate_dinner: e.target.value })}
                            >
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="Partial">Partial</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>
                        </Stack>

                        <Box sx={{ border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 2, p: 2, textAlign: 'center' }}>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                onChange={handleFileUpload}
                            />
                            <label htmlFor="raised-button-file">
                                <Button component="span" startIcon={uploading ? <CircularProgress size={20} /> : <AddAPhoto />} disabled={uploading} sx={{ color: 'text.secondary' }}>
                                    {uploading ? "Uploading..." : "Upload Photo (Moment)"}
                                </Button>
                            </label>
                            {reportData.image_url && (
                                <Box sx={{ mt: 2, position: 'relative', width: '100%', height: 200 }}>
                                    <Image
                                        src={reportData.image_url.startsWith('http') ? reportData.image_url : `${API_BASE_URL}${reportData.image_url}`}
                                        alt="Preview"
                                        fill
                                        style={{ objectFit: 'contain', borderRadius: 8 }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => setReportData({ ...reportData, image_url: "" })}
                                        sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', zIndex: 10 }}
                                    >
                                        <Cancel />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        <TextField
                            label="Notes for Owner"
                            fullWidth
                            multiline
                            rows={3}
                            variant="filled"
                            value={reportData.notes}
                            onChange={e => setReportData({ ...reportData, notes: e.target.value })}
                            placeholder="How was their day? Any specifics?"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setShowReportModal(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitReport}
                        disabled={submittingReport}
                        sx={{ bgcolor: '#D4AF37', color: 'black', '&:hover': { bgcolor: '#b5932b' }, fontWeight: 'bold' }}
                    >
                        {submittingReport ? <CircularProgress size={24} /> : "Push to Client"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* INCIDENT HISTORY MODAL */}
            <Dialog
                open={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <History />
                        <Box>
                            <Typography variant="h6">Incident History</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedPet?.name}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {historyLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress sx={{ color: '#D4AF37' }} />
                        </Box>
                    ) : incidentHistory.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <CheckCircle sx={{ fontSize: 40, mb: 2, color: '#22c55e', opacity: 0.5 }} />
                            <Typography>No incidents recorded for this guest.</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {incidentHistory.map((inc) => (
                                <Paper key={inc.id} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                        <Chip
                                            label={inc.severity}
                                            size="small"
                                            sx={{
                                                bgcolor: inc.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : inc.severity === 'High' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                                color: inc.severity === 'Critical' ? '#ef4444' : inc.severity === 'High' ? '#f97316' : '#eab308',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(inc.timestamp).toLocaleString()}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1">{inc.content}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button onClick={() => setShowHistoryModal(false)} sx={{ color: 'text.secondary' }}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
