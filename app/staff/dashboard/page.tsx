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
    Alert,
    Snackbar,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
    Switch,
    Badge as MuiBadge,
} from "@mui/material";
import {
    Settings,
    Store,
    Security,
    People,
    AttachMoney,
    Warning,
    Chat as MessageIcon,
    Assignment as AssignmentIcon,
    Restaurant,
    DirectionsWalk,
    Medication,
    Add,
    Dashboard,
    TrendingUp,
    Face,
    CheckCircle,
    Cancel,
    Badge,
    Send,
    CrisisAlert,
    Error as ErrorIcon,
    History,
    Fingerprint,
    BugReport,
    Favorite,
    ContentCut,
    AddAPhoto,
    Visibility,
    VisibilityOff,
    PersonAdd,
    Chat as ChatIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import BusinessDashboard from './components/BusinessDashboard';
import BookingRequestManager from './components/BookingRequestManager';
import OperationsStats from './components/OperationsStats';
import ServiceManager from './components/ServiceManager';
import GuestList from './components/GuestList';
import ClientDirectory from './components/ClientDirectory';
import { useStaffDashboard } from "./hooks/useStaffDashboard";
import { API_BASE_URL, authenticatedFetch } from '@/lib/api';
import { GuestPet, GroupedBookingRequest } from "@/types";

// New Modular Components
import CheckInModal from "./components/CheckInModal";
import IncidentModal from "./components/IncidentModal";
import StaffManagementDialog from "./components/StaffManagementDialog";
import DailyReportModal from "./components/DailyReportModal";
import BookingDetailsModal from "./components/BookingDetailsModal";

export default function StaffDashboard() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selectedBookingGroup, setSelectedBookingGroup] = useState<GroupedBookingRequest | null>(null);
    const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);

    const {
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
    } = useStaffDashboard();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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
                                startIcon={<MessageIcon />}
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
                            onCheckOut={handleCheckOut}
                            onToggleAction={toggleAction}
                            onLogIncident={(guest) => {
                                setSelectedPet(guest);
                                setShowIncidentModal(true);
                            }}
                            onPostReport={handleOpenReport}
                            onViewHistory={handleViewHistory}
                            onGuestClick={(guest) => {
                                setSelectedPet(guest);
                                const client = clients.find(c => c.email === guest.owner_email);
                                if (client) setSelectedClient(client);
                                setShowPetModal(true);
                            }}
                            onViewBooking={(guest) => {
                                if (!guest.booking_id) return;
                                const booking = allBookings.find((b: any) => b.id === guest.booking_id);
                                if (booking) {
                                    // Quick grouping for single booking view
                                    const group = {
                                        id: booking.id,
                                        owner_name: booking.owner_name || guest.name + "'s Owner", // Fallback
                                        owner_email: booking.user_email,
                                        start_date: booking.start_date,
                                        end_date: booking.end_date,
                                        bookings: [booking]
                                    };
                                    setSelectedBookingGroup(group);
                                    setShowBookingDetailsModal(true);
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
                                    fetchMessages(client.email);
                                    setViewMode('comms');
                                }
                            }}
                            onViewDetails={(group) => {
                                setSelectedBookingGroup(group);
                                setShowBookingDetailsModal(true);
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
                        {selectedClient?.pets?.filter((p: any) => !selectedPet || p.id === selectedPet.id).map((pet: any, i: number, arr: any[]) => (
                            <Box key={i} sx={{ mb: 4 }}>
                                <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                                    <Avatar
                                        src={pet.image_url ? (pet.image_url.startsWith('http') ? pet.image_url : `${API_BASE_URL}${pet.image_url}`) : pet.photo_url}
                                        sx={{ width: 80, height: 80, border: '2px solid #D4AF37', bgcolor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        {pet.name[0]}
                                    </Avatar>
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

                {/* Modularized Dialogs */}
                <IncidentModal
                    open={showIncidentModal}
                    onClose={() => setShowIncidentModal(false)}
                    selectedPet={selectedPet}
                    incidentTargetId={incidentTargetId}
                    onTargetIdChange={setIncidentTargetId}
                    guests={guests}
                    incidentSeverity={incidentSeverity}
                    onSeverityChange={setIncidentSeverity}
                    incidentText={incidentText}
                    onTextChange={setIncidentText}
                    onLogIncident={handleLogIncident}
                />

                <CheckInModal
                    open={showCheckInModal}
                    onClose={() => setShowCheckInModal(false)}
                    todaysArrivals={todaysArrivals}
                    isOwner={isOwner}
                    onMarkPaid={handleMarkPaid}
                    onCheckIn={handleCheckIn}
                />

                <StaffManagementDialog
                    open={openAddStaff}
                    onClose={() => setOpenAddStaff(false)}
                    formError={formError}
                    formSuccess={formSuccess}
                    newStaff={newStaff}
                    onNewStaffChange={setNewStaff}
                    showPassword={showPassword}
                    onShowPasswordToggle={() => setShowPassword(!showPassword)}
                    onAddStaff={handleAddStaff}
                    loadingStaff={loadingStaff}
                />

                <DailyReportModal
                    open={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    selectedPet={selectedPet}
                    reportData={reportData}
                    onReportDataChange={setReportData}
                    onFileUpload={handleFileUpload}
                    uploading={uploading}
                    onSubmitReport={handleSubmitReport}
                    submittingReport={submittingReport}
                />

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

                <Snackbar
                    open={message.open}
                    autoHideDuration={6000}
                    onClose={() => setMessage({ ...message, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setMessage({ ...message, open: false })} severity={message.severity} sx={{ width: '100%' }}>
                        {message.text}
                    </Alert>
                </Snackbar>
            </Container>
            {/* Booking Details Modal */}
            <BookingDetailsModal
                open={showBookingDetailsModal}
                onClose={() => setShowBookingDetailsModal(false)}
                group={selectedBookingGroup}
            />
        </Box>
    );
}
