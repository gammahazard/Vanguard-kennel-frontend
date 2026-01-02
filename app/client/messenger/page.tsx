"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
    Box, Typography, Container, Stack, Paper, TextField, IconButton,
    Avatar, CircularProgress, ThemeProvider, CssBaseline, BottomNavigation,
    BottomNavigationAction, AppBar, Toolbar, Skeleton, Badge
} from "@mui/material";
import {
    Send, ArrowBack, Home, Pets as PetIcon, CalendarMonth,
    Person, Chat as ChatIcon
} from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

import { authenticatedFetch } from "@/lib/api";
import { formatDateTimeEST } from "@/lib/dateUtils";

export default function MessengerView() {
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [navValue, setNavValue] = useState(3);

    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email')?.toLowerCase() || "" : "";
    const staffEmail = "staff@vanguard.com".toLowerCase();

    // Get staff info from messages
    const staffInfo = useMemo(() => {
        const staffMessages = messages.filter(m => m.sender_email.toLowerCase() !== userEmail.toLowerCase());
        if (staffMessages.length === 0) return { name: "Staff Support", email: "staff@vanguard.com", isOnline: false };

        const lastStaffMsg = staffMessages[staffMessages.length - 1];
        const lastMsgTime = new Date(lastStaffMsg.timestamp).getTime();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

        return {
            name: lastStaffMsg.sender_name || "Staff Support",
            email: lastStaffMsg.sender_email,
            isOnline: lastMsgTime > fiveMinutesAgo
        };
    }, [messages, userEmail]);

    const fetchMessages = async () => {
        if (!userEmail) return;
        try {
            // AUTH UPDATE: Use authenticatedFetch & remove email query param
            const res = await authenticatedFetch(`/api/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);

                // If the last message is from staff and unread, mark all staff messages as read
                const unreadFromStaff = data.some((m: any) =>
                    m.sender_email.toLowerCase() !== userEmail.toLowerCase() &&
                    m.is_read === 0
                );

                if (unreadFromStaff) {
                    markRead();
                }
            } else {
                console.error("Failed to fetch messages:", res.status);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setLoading(false);
        }
    };

    const markRead = async () => {
        try {
            await authenticatedFetch(`/api/messages/read`, {
                method: 'PUT',
                body: JSON.stringify({ sender_email: staffEmail })
            });
        } catch (err) {
            console.error("Failed to mark messages as read", err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !userEmail || sending) return;
        setSending(true);
        try {
            const res = await authenticatedFetch(`/api/messages`, {
                method: 'POST',
                // Header handled by helper
                body: JSON.stringify({
                    sender: userEmail.toLowerCase(),
                    receiver: staffEmail.toLowerCase(),
                    content: newMessage
                })
            });
            if (res.ok) {
                setNewMessage("");
                fetchMessages();
            } else {
                const errorText = await res.text();
                console.error("Failed to send message:", res.status, errorText);
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleNavChange = (event: any, newValue: number) => {
        if (newValue === 0) router.push('/client/dashboard');
        if (newValue === 1) router.push('/client/pets');
        if (newValue === 2) router.push('/client/bookings');
        if (newValue === 4) router.push('/client/profile');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                {/* Header */}
                <AppBar position="static" elevation={0} sx={{ bgcolor: 'rgba(5, 6, 8, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Toolbar>
                        <IconButton onClick={() => router.back()} sx={{ color: 'white', mr: 2 }}>
                            <ArrowBack />
                        </IconButton>
                        <Avatar sx={{ bgcolor: staffInfo.isOnline ? 'primary.main' : 'rgba(255,255,255,0.1)', color: staffInfo.isOnline ? 'black' : 'text.secondary', mr: 2, fontWeight: 'bold' }}>
                            {staffInfo.name[0]?.toUpperCase() || 'S'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{staffInfo.name}</Typography>
                            <Typography variant="caption" sx={{ color: staffInfo.isOnline ? '#22c55e' : 'text.secondary' }}>
                                {staffInfo.isOnline ? '● Online' : '○ Offline'}
                            </Typography>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Chat Area */}
                <Box
                    ref={scrollRef}
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        background: 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.03), transparent)'
                    }}
                >
                    {loading ? (
                        <Stack spacing={2}>
                            {[1, 2, 3].map(i => (
                                <Box key={i} sx={{ alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start', width: '60%' }}>
                                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />
                                    <Skeleton width="30%" height={15} sx={{ mt: 0.5, alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start' }} />
                                </Box>
                            ))}
                        </Stack>
                    ) : messages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                            <ChatIcon sx={{ fontSize: 60, mb: 1 }} />
                            <Typography variant="body1">Start a conversation with our staff</Typography>
                        </Box>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_email.toLowerCase() === userEmail.toLowerCase();
                            return (
                                <Box
                                    key={i}
                                    sx={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%'
                                    }}
                                >
                                    {!isMe && (
                                        <Typography variant="caption" sx={{ ml: 1, mb: 0.5, display: 'block', color: 'primary.main', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                            {msg.sender_name || "Support Team"}
                                        </Typography>
                                    )}
                                    <Paper sx={{
                                        p: 1.5,
                                        px: 2,
                                        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        bgcolor: isMe ? 'primary.main' : 'rgba(255,255,255,0.05)',
                                        color: isMe ? 'black' : 'white',
                                        border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <Typography variant="body2">{msg.content}</Typography>
                                    </Paper>
                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: isMe ? 'right' : 'left', opacity: 0.5 }}>
                                        {formatDateTimeEST(msg.timestamp)}
                                    </Typography>
                                </Box>
                            );
                        })
                    )}
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 2, pb: 11, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(5,6,8,0.5)' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', '::-webkit-scrollbar': { display: 'none' } }}>
                        <IconButton
                            onClick={() => {
                                setNewMessage("Can I get a quick status update on my pet? 🐾");
                                setTimeout(handleSendMessage, 100);
                            }}
                            sx={{
                                bgcolor: 'rgba(212, 175, 55, 0.1)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: 2,
                                px: 1.5,
                                py: 1,
                                height: 'auto',
                                width: 'auto'
                            }}
                        >
                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>[Status Request]</Typography>
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setNewMessage("I'd like to update the feeding notes for my upcoming booking.");
                            }}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 2,
                                px: 1.5,
                                py: 1,
                                height: 'auto',
                                width: 'auto'
                            }}
                        >
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>[Update Feeding Notes]</Typography>
                        </IconButton>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <TextField
                            fullWidth
                            placeholder="Message staff..."
                            variant="outlined"
                            size="small"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 4,
                                    bgcolor: 'rgba(255,255,255,0.03)'
                                }
                            }}
                        />
                        <IconButton
                            onClick={handleSendMessage}
                            disabled={sending || !newMessage.trim()}
                            sx={{ bgcolor: 'primary.main', color: 'black', '&:hover': { bgcolor: '#D4AF37' } }}
                        >
                            {sending ? <CircularProgress size={20} /> : <Send />}
                        </IconButton>
                    </Stack>
                </Box>

                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
                    <BottomNavigation
                        value={navValue}
                        onChange={handleNavChange}
                        showLabels
                        sx={{
                            bgcolor: '#0B0C10',
                            height: 70,
                            '& .Mui-selected': { color: '#D4AF37 !important' },
                            '& .MuiBottomNavigationAction-label': { fontSize: '0.7rem', mt: 0.5 }
                        }}
                    >
                        <BottomNavigationAction label="Home" icon={<Home />} />
                        <BottomNavigationAction label="Pets" icon={<PetIcon />} />
                        <BottomNavigationAction label="Bookings" icon={<CalendarMonth />} />
                        <BottomNavigationAction label="Chat" icon={
                            <Badge badgeContent={0} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                                <ChatIcon />
                            </Badge>
                        } />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper>
            </Box>
        </ThemeProvider>
    );
}
