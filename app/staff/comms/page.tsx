"use client";

import { Box, Typography, Paper, Stack, Container, TextField, InputAdornment, Chip, Avatar, Tooltip, IconButton, Divider, CircularProgress, Button, Snackbar } from "@mui/material";
import {
    Search,
    FilterList,
    Person,
    AccessTime,
    ArrowForward,
    MarkChatRead,
    AdminPanelSettings
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: number;
    sender_email: string;
    receiver_email: string;
    content: string;
    timestamp: string;
}

export default function StaffCommsLog() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<'all' | 'staff' | 'client'>('all');

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string }>({ open: false, message: "" });

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("vanguard_token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/messages`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch global messages", error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (email: string) => {
        if (email.includes('owner') || email.includes('admin')) return { label: 'OWNER', color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.1)' };
        if (email.includes('staff') || email.includes('vanguard')) return { label: 'STAFF', color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' };
        return { label: 'CLIENT', color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' };
    };

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        setSnackbar({ open: true, message: `Copied ${email} to clipboard` });
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.sender_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.receiver_email.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        const isSenderStaff = msg.sender_email.includes('vanguard') || msg.sender_email.includes('admin') || msg.sender_email.includes('owner');
        const isReceiverStaff = msg.receiver_email.includes('vanguard') || msg.receiver_email.includes('admin') || msg.receiver_email.includes('owner');

        if (filter === 'staff') return isSenderStaff && isReceiverStaff; // Internal comms
        if (filter === 'client') return !isSenderStaff || !isReceiverStaff; // Involves a client

        return true;
    });

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="lg">

                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AdminPanelSettings sx={{ color: 'text.secondary' }} />
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={1}>
                                OVERSIGHT
                            </Typography>
                        </Stack>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            The Black Box
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Global communication log. Total visibility.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                            label={`${messages.length} Total Messages`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontWeight: 'medium' }}
                        />
                    </Stack>
                </Stack>

                {/* Filter Bar */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            placeholder="Search by name, email, or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search sx={{ color: '#D4AF37' }} /></InputAdornment>,
                                sx: { bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, '& fieldset': { borderColor: 'rgba(212, 175, 55, 0.2)' } }
                            }}
                            size="small"
                        />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip
                                label="All"
                                onClick={() => setFilter('all')}
                                size="small"
                                sx={{
                                    bgcolor: filter === 'all' ? '#D4AF37' : 'transparent',
                                    color: filter === 'all' ? 'black' : '#94a3b8',
                                    fontWeight: 'bold',
                                    border: filter === 'all' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer'
                                }}
                            />
                            <Chip
                                label="Client Comms"
                                onClick={() => setFilter('client')}
                                size="small"
                                sx={{
                                    bgcolor: filter === 'client' ? '#10b981' : 'transparent',
                                    color: filter === 'client' ? 'white' : '#94a3b8',
                                    fontWeight: 'bold',
                                    border: filter === 'client' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer'
                                }}
                            />
                            <Chip
                                label="Internal"
                                onClick={() => setFilter('staff')}
                                size="small"
                                sx={{
                                    bgcolor: filter === 'staff' ? '#3b82f6' : 'transparent',
                                    color: filter === 'staff' ? 'white' : '#94a3b8',
                                    fontWeight: 'bold',
                                    border: filter === 'staff' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer'
                                }}
                            />
                        </Stack>
                    </Stack>
                </Paper>

                {/* Message Stream */}
                <Stack spacing={2}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress size={40} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading records...</Typography>
                        </Box>
                    ) : (
                        <AnimatePresence>
                            {filteredMessages.map((msg) => {
                                const senderBadge = getRoleBadge(msg.sender_email);
                                const receiverBadge = getRoleBadge(msg.receiver_email);

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        layout
                                    >
                                        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.02)' }}>
                                            <Stack direction="row" spacing={3} alignItems="flex-start">

                                                {/* Timestamp Column */}
                                                <Box sx={{ minWidth: 100, pt: 0.5 }}>
                                                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ opacity: 0.5 }}>
                                                        <AccessTime sx={{ fontSize: 14 }} />
                                                        <Typography variant="caption" fontFamily="monospace">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.3, display: 'block', mt: 0.5 }}>
                                                        {new Date(msg.timestamp).toLocaleDateString()}
                                                    </Typography>
                                                </Box>

                                                {/* Actors Column */}
                                                <Box sx={{ minWidth: 200 }}>
                                                    <Tooltip title="Click to copy email">
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                            sx={{ mb: 1, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                                                            onClick={() => handleCopyEmail(msg.sender_email)}
                                                        >
                                                            <Chip label={senderBadge.label} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: senderBadge.bgcolor, color: senderBadge.color, fontWeight: 'bold' }} />
                                                            <Typography variant="caption" fontWeight="bold" color="text.primary">
                                                                {msg.sender_email.split('@')[0]}
                                                            </Typography>
                                                        </Stack>
                                                    </Tooltip>
                                                    <ArrowForward sx={{ fontSize: 14, color: 'text.disabled', my: 0.5, transform: 'rotate(90deg)' }} />
                                                    <Tooltip title="Click to copy email">
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                            sx={{ mt: 1, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                                                            onClick={() => handleCopyEmail(msg.receiver_email)}
                                                        >
                                                            <Chip label={receiverBadge.label} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: receiverBadge.bgcolor, color: receiverBadge.color, fontWeight: 'bold' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {msg.receiver_email.split('@')[0]}
                                                            </Typography>
                                                        </Stack>
                                                    </Tooltip>
                                                </Box>

                                                {/* Content Column */}
                                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

                                                <Box sx={{ flex: 1, pt: 0.5 }}>
                                                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                                                        {msg.content}
                                                    </Typography>
                                                </Box>

                                            </Stack>
                                        </Paper>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </Stack>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={2000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    message={snackbar.message}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />

            </Container>
        </Box>
    );
}
