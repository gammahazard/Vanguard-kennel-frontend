"use client";

import { Box, Typography, Paper, Stack, Container, TextField, InputAdornment, Chip, Avatar, Tooltip, IconButton, Divider, CircularProgress, Button, Snackbar } from "@mui/material";
import {
    Search,
    FilterList,
    Person,
    AccessTime,
    ArrowForward,
    MarkChatRead,
    AdminPanelSettings,
    Refresh,
    Message as MessageIcon
} from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: number;
    sender_email: string;
    receiver_email: string;
    content: string;
    timestamp: string;
    sender_name?: string;
}

interface Conversation {
    clientEmail: string;
    clientName: string;
    messages: Message[];
    lastMessage: Message;
    unreadCount: number;
}

export default function StaffCommsLog() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<'all' | 'staff' | 'client'>('all');
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string }>({ open: false, message: "" });

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("vanguard_token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.pokeframe.me'}/api/admin/messages`, {
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
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('owner') || lowerEmail.includes('admin')) return { label: 'OWNER', color: '#D4AF37', bgcolor: 'rgba(212, 175, 55, 0.1)' };
        if (lowerEmail.includes('staff') || lowerEmail.includes('vanguard')) return { label: 'STAFF', color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' };
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

    // Group messages into conversations (by client email)
    const conversations: Conversation[] = useMemo(() => {
        const staffEmails = ['owner@vanguard.com', 'staff@vanguard.com', 'admin@vanguard.com'];
        const convoMap = new Map<string, Message[]>();

        filteredMessages.forEach(msg => {
            const isStaffSender = staffEmails.some(s => msg.sender_email.toLowerCase().includes(s.split('@')[0]));
            const clientEmail = isStaffSender ? msg.receiver_email : msg.sender_email;

            if (!convoMap.has(clientEmail)) {
                convoMap.set(clientEmail, []);
            }
            convoMap.get(clientEmail)!.push(msg);
        });

        return Array.from(convoMap.entries()).map(([email, msgs]) => {
            const sorted = msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return {
                clientEmail: email,
                clientName: sorted[0]?.sender_name || email.split('@')[0],
                messages: sorted.reverse(), // Show oldest first in conversation
                lastMessage: sorted[sorted.length - 1],
                unreadCount: 0
            };
        }).sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
    }, [filteredMessages]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0B0C10', minHeight: '100vh', color: '#f8fafc' }}>
            <Container maxWidth="lg">

                {/* Header */}
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AdminPanelSettings sx={{ color: '#D4AF37' }} />
                            <Typography variant="overline" color="#D4AF37" fontWeight="bold" letterSpacing={1}>
                                SYSTEM OVERSIGHT
                            </Typography>
                        </Stack>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', borderBottom: '2px solid #D4AF37', display: 'inline-block', pb: 0.5 }}>
                            The Black Box
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                            Global communication intercept. Full transparency.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Chip
                            label={`${messages.length} RECORDS`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}
                        />
                        <Button
                            size="small"
                            startIcon={<Refresh />}
                            onClick={fetchMessages}
                            sx={{ color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)', border: '1px solid', '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.05)' } }}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Stack>

                {/* Filter Bar */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            placeholder="Search records by name, email, or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search sx={{ color: '#D4AF37' }} /></InputAdornment>,
                                sx: { bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(212, 175, 55, 0.2)' } }
                            }}
                            size="small"
                        />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {(['all', 'client', 'staff'] as const).map((mode) => (
                                <Chip
                                    key={mode}
                                    label={mode === 'all' ? 'FULL STREAM' : mode === 'client' ? 'CLIENT COMMS' : 'INTERNAL OPS'}
                                    onClick={() => setFilter(mode)}
                                    size="small"
                                    sx={{
                                        bgcolor: filter === mode ? (mode === 'all' ? '#D4AF37' : mode === 'client' ? '#10b981' : '#3b82f6') : 'transparent',
                                        color: filter === mode ? (mode === 'all' ? 'black' : 'white') : '#94a3b8',
                                        fontWeight: 'bold',
                                        border: filter === mode ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: filter === mode ? '' : 'rgba(255,255,255,0.05)' }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Paper>

                {/* Message Stream */}
                <Stack spacing={1.5}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress size={32} sx={{ color: '#D4AF37' }} />
                            <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#64748b', letterSpacing: 2 }}>ESTABLISHING LINK...</Typography>
                        </Box>
                    ) : filteredMessages.length === 0 ? (
                        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.01)', borderRadius: 3, border: '1px dashed rgba(255,255,255,0.05)' }}>
                            <MessageIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.05)', mb: 2 }} />
                            <Typography sx={{ color: '#64748b' }}>NO INTERCEPTED COMMUNICATIONS FOUND</Typography>
                        </Paper>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredMessages.map((msg, i) => {
                                const senderBadge = getRoleBadge(msg.sender_email);
                                const receiverBadge = getRoleBadge(msg.receiver_email);

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.02 }}
                                        layout
                                    >
                                        <Paper sx={{
                                            p: 0,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255,255,255,0.015)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderLeft: `3px solid ${senderBadge.color}`,
                                            overflow: 'hidden',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(212, 175, 55, 0.2)' },
                                            transition: 'all 0.2s'
                                        }}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0}>

                                                {/* Left Panel: Actors & Meta */}
                                                <Box sx={{ p: 2, minWidth: { sm: 220 }, bgcolor: 'rgba(0,0,0,0.2)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Stack spacing={1.5}>
                                                        {/* Timestamp */}
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.5 }}>
                                                            <AccessTime sx={{ fontSize: 12 }} />
                                                            <Typography variant="caption" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                            </Typography>
                                                        </Stack>

                                                        {/* Actors */}
                                                        <Box>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                                <Chip label={senderBadge.label} size="small" sx={{ height: 14, fontSize: '0.55rem', bgcolor: senderBadge.bgcolor, color: senderBadge.color, fontWeight: 'bold', borderRadius: 0.5 }} />
                                                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {msg.sender_email.split('@')[0]}
                                                                </Typography>
                                                            </Stack>
                                                            <ArrowForward sx={{ fontSize: 10, color: '#64748b', ml: 1, my: 0.2, transform: 'rotate(90deg)' }} />
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Chip label={receiverBadge.label} size="small" sx={{ height: 14, fontSize: '0.55rem', bgcolor: receiverBadge.bgcolor, color: receiverBadge.color, fontWeight: 'bold', borderRadius: 0.5 }} />
                                                                <Typography variant="caption" sx={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {msg.receiver_email.split('@')[0]}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>

                                                        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.65rem' }}>
                                                            {new Date(msg.timestamp).toLocaleDateString()}
                                                        </Typography>
                                                    </Stack>
                                                </Box>

                                                {/* Right Panel: Content */}
                                                <Box sx={{ p: 2.5, flex: 1, position: 'relative' }}>
                                                    <Typography variant="body2" sx={{
                                                        color: '#e2e8f0',
                                                        lineHeight: 1.7,
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        fontFamily: i % 2 === 0 ? 'inherit' : 'monospace',
                                                        fontSize: i % 2 === 0 ? '0.875rem' : '0.8rem',
                                                        opacity: 0.9
                                                    }}>
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
