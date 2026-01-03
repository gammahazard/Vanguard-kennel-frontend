import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { API_BASE_URL, authenticatedFetch } from '@/lib/api';
import {
    GuestPet,
    UserWithPets,
    GroupedBookingRequest,
    EnrichedBooking,
    Message,
    User,
    Pet,
    Incident,
    Service
} from '@/types';

export function useStaffDashboard() {
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

    // Staff Management State
    const [openAddStaff, setOpenAddStaff] = useState(false);
    const [staffList, setStaffList] = useState<User[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    // Business Pricing State
    const [services, setServices] = useState<Service[]>([]);
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

    const fetchDashboardData = useCallback(async () => {
        setLoadingBookings(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/staff/bookings`);
            if (res.ok) {
                const data = await res.json();
                setAllBookings(data);

                const pending = data.filter((b: any) => b.status?.toLowerCase() === 'pending');
                const confirmed = data.filter((b: any) => b.status?.toLowerCase() === 'confirmed');
                const checkedIn = data.filter((b: any) => b.status?.toLowerCase() === 'checked in');
                const noShow = data.filter((b: any) => b.status?.toLowerCase() === 'no show');

                setPendingBookings(groupBookings(pending));
                const groupedConfirmed = groupBookings(confirmed);
                setRecentBookings(groupedConfirmed.slice(0, 10)); // Increased for visibility

                const today = new Date();
                const todayStr = today.toDateString();
                const arrivals = confirmed.filter((b: any) => {
                    const start = new Date(b.start_date + 'T00:00:00').toDateString();
                    return start === todayStr;
                });
                setTodaysArrivals(arrivals);

                const guestsInHouseCount = checkedIn.length;
                const departures = checkedIn.filter((b: any) => new Date(b.end_date + 'T00:00:00').toDateString() === todayStr).length;

                setStats([
                    { label: "Guests In House", value: guestsInHouseCount.toString(), color: "primary.main" },
                    { label: "Check-Ins Today", value: arrivals.length.toString(), color: "text.primary" },
                    { label: "Departures", value: departures.toString(), color: "text.secondary" }
                ]);

                const mappedGuests: GuestPet[] = checkedIn.map((b: any) => ({
                    id: b.dog_id,
                    name: b.dog_name || 'Guest',
                    breed: 'Unknown',
                    status: 'Active',
                    alerts: b.notes ? [b.notes] : [],
                    fed: false,
                    walked: false,
                    meds: null,
                    img: b.dog_photo_url ? (b.dog_photo_url.startsWith('http') ? b.dog_photo_url : `${API_BASE_URL}${b.dog_photo_url}`) : `https://placedog.net/400/300?id=${b.dog_id.charCodeAt(0)}`,
                    owner_email: b.user_email
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
        setLoadingStaff(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/staff`);
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (e) {
            console.error("Failed to fetch staff", e);
        } finally {
            setLoadingStaff(false);
        }
    }, []);

    const fetchMessages = useCallback(async (targetEmail: string) => {
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/messages?email=${encodeURIComponent(targetEmail)}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
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
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/services/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ price: newPrice })
            });

            if (res.ok) {
                setMessage({ text: "Price updated successfully", severity: "success", open: true });
                fetchServices();
            } else {
                setMessage({ text: "Failed to update price", severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Failed to update price", severity: "error", open: true });
        }
    };

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
                    booking_id: null,
                    pet_id: selectedPet?.id || incidentTargetId,
                    content: incidentText,
                    severity: incidentSeverity
                })
            });

            if (res.ok) {
                setMessage({ text: "Alert logged successfully!", severity: "success", open: true });
                setShowIncidentModal(false);
                setIncidentText("");
                fetchDashboardData();
            } else {
                setMessage({ text: "Failed to log alert", severity: "error", open: true });
            }
        } catch (e) {
            console.error("Incident log failed", e);
        }
    };

    const handleBookingAction = async (id: string, action: 'confirmed' | 'cancelled' | 'declined' | 'No Show') => {
        const verb = action === 'confirmed' ? 'Accept' : (action === 'declined' ? 'Decline' : (action === 'cancelled' ? 'Cancel' : 'Mark No Show'));
        const note = prompt(`Optional: Enter a reason/note for this ${verb} action:`);

        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: action, note: note || undefined })
            });

            if (res.ok) {
                setMessage({ text: `Booking updated to ${action}!`, severity: "success", open: true });
                fetchDashboardData();
            } else if (res.status === 400) {
                setMessage({ text: "Late Cancellation: Cannot cancel within 72 hours of start.", severity: "warning", open: true });
            } else {
                setMessage({ text: `Update failed`, severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Failed to update booking", severity: "error", open: true });
        }
    };

    const handleBatchAction = async (bookings: EnrichedBooking[] | GroupedBookingRequest['bookings'], action: 'confirmed' | 'declined' | 'cancelled' | 'No Show') => {
        const verb = action === 'confirmed' ? 'Accept' : (action === 'declined' ? 'Decline' : (action === 'cancelled' ? 'Cancel' : 'Mark No Show'));
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

            if (errors.length === 0) {
                setMessage({ text: "All bookings updated successfully", severity: "success", open: true });
            } else {
                setMessage({ text: `Some updates failed: ${errors.join(', ')}`, severity: "warning", open: true });
            }
            fetchDashboardData();
        } finally {
            setLoadingBookings(false);
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
                fetchDashboardData();
            } else if (res.status === 402) {
                setMessage({ text: "Payment Required: Please settle balance before check-in.", severity: "warning", open: true });
            } else {
                setMessage({ text: "Check-in failed", severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Check-in failed", severity: "error", open: true });
        }
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

    const handleMarkPaid = async (booking: EnrichedBooking) => {
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${booking.id}/payment`, {
                method: 'PUT',
                body: JSON.stringify({ is_paid: true })
            });

            if (res.ok) {
                setMessage({ text: "Payment confirmed!", severity: "success", open: true });
                fetchDashboardData();
            } else {
                setMessage({ text: "Failed to mark paid", severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Failed to mark paid", severity: "error", open: true });
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingStaff(true);
        setFormError("");
        setFormSuccess("");

        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/users`, {
                method: "POST",
                body: JSON.stringify(newStaff)
            });

            if (res.ok) {
                setFormSuccess("Employee added successfully!");
                setNewStaff({ name: "", email: "", password: "", role: "staff" });
                fetchStaff();
            } else {
                const data = await res.json();
                setFormError(data.error || "Failed to add employee");
            }
        } catch (err: any) {
            setFormError(`Failed to add employee: ${err.message}`);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleDeleteStaff = async (email: string) => {
        if (!confirm(`Are you sure you want to remove ${email} from the team?`)) return;
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/admin/users/${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setMessage({ text: "Staff member removed", severity: "success", open: true });
                fetchStaff();
            } else {
                setMessage({ text: "Failed to remove staff", severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Failed to remove staff", severity: "error", open: true });
        }
    };

    const handleSubmitReport = async () => {
        setSubmittingReport(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/reports`, {
                method: "POST",
                body: JSON.stringify(reportData)
            });

            if (res.ok) {
                setMessage({ text: "Report card sent to owner! 💌", severity: "success", open: true });
                setShowReportModal(false);
            } else {
                setMessage({ text: "Failed to send report", severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Connection error", severity: "error", open: true });
        } finally {
            setSubmittingReport(false);
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

    const handleViewHistory = async (pet: any) => {
        setHistoryLoading(true);
        setShowHistoryModal(true);
        setSelectedPet(pet);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/incidents?pet_id=${pet.id}`);
            if (res.ok) {
                setIncidentHistory(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('vanguard_token')}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setReportData(prev => ({ ...prev, image_url: data.url }));
                setMessage({ text: "Photo uploaded successfully!", severity: "success", open: true });
            } else {
                setMessage({ text: "Upload failed", severity: "error", open: true });
            }
        } catch (e) {
            setMessage({ text: "Upload failed", severity: "error", open: true });
        } finally {
            setUploading(false);
        }
    };

    const handleOpenReport = async (pet: any) => {
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/staff/bookings`);
            if (res.ok) {
                const bookings = await res.json();
                const active = bookings.find((b: any) =>
                    b.dog_id === pet.id &&
                    (b.status.toLowerCase() === 'confirmed' || b.status.toLowerCase() === 'checked in')
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

    // Optimized sorting
    const sortedDirectoryClients = useMemo(() => {
        return [...clients].sort((a, b) => {
            const unreadA = a.unread_messages_count || 0;
            const unreadB = b.unread_messages_count || 0;
            if (unreadB !== unreadA) return unreadB - unreadA;

            const petsA = a.pets?.length || 0;
            const petsB = b.pets?.length || 0;
            if (petsA > 0 && petsB === 0) return -1;
            if (petsA === 0 && petsB > 0) return 1;

            const nameA = a.name || a.email || "";
            const nameB = b.name || b.email || "";
            return nameA.localeCompare(nameB);
        });
    }, [clients]);

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

    // Auto-Polling
    useEffect(() => {
        const role = localStorage.getItem('vanguard_role');
        if (role === 'owner') {
            setIsOwner(true);
            fetchStaff();
            fetchServices();
        }
        fetchDashboardData();
        fetchClients();
    }, [fetchDashboardData, fetchClients, fetchStaff, fetchServices]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData();
            fetchClients();
            if (viewMode === 'comms' && activeChat) {
                fetchMessages(activeChat.email);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [viewMode, activeChat, fetchDashboardData, fetchClients, fetchMessages]);

    return {
        guests, loadingGuests, viewMode, setViewMode, isOwner, message, setMessage,
        pendingBookings, recentBookings, todaysArrivals, allBookings, clients,
        loadingBookings, loadingClients, stats,
        selectedClient, setSelectedClient, showPetModal, setShowPetModal,
        showCheckInModal, setShowCheckInModal, showIncidentModal, setShowIncidentModal,
        selectedPet, setSelectedPet, incidentText, setIncidentText,
        incidentSeverity, setIncidentSeverity, incidentTargetId, setIncidentTargetId,
        showHistoryModal, setShowHistoryModal, incidentHistory, setIncidentHistory,
        historyLoading, setHistoryLoading,
        activeChat, setActiveChat, newMessage, setNewMessage, messages, sendingMsg,
        openAddStaff, setOpenAddStaff, staffList, loadingStaff,
        services, loadingServices, priceEdits, setPriceEdits,
        newStaff, setNewStaff, showPassword, setShowPassword,
        formError, setFormError, formSuccess, setFormSuccess,
        showSettingsDialog, setShowSettingsDialog,
        showReportModal, setShowReportModal, reportData, setReportData,
        submittingReport, uploading,
        fetchDashboardData, fetchClients, fetchStaff, fetchMessages, fetchServices,
        handleUpdatePrice, markAsRead, handleSendMessage, handleLogIncident,
        handleBookingAction, handleBatchAction, handleCheckIn, handleCheckOut,
        handleMarkPaid, handleAddStaff, handleDeleteStaff, handleSubmitReport, handleFileUpload,
        handleViewHistory, toggleAction, handleOpenReport,
        sortedDirectoryClients, sortedCommsClients
    };
}
