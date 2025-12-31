"use client";

import { useState, useEffect, useRef } from "react";
import {
    Box, Typography, Container, Stack, Paper, TextField, IconButton,
    Avatar, CircularProgress, ThemeProvider, CssBaseline, BottomNavigation,
    BottomNavigationAction, AppBar, Toolbar, Skeleton
} from "@mui/material";
import {
    Send, ArrowBack, Home, Pets as PetIcon, CalendarMonth,
    Person, Chat as ChatIcon
} from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

export default function MessengerView() {
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [navValue, setNavValue] = useState(3);

    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email') : "";
    const staffEmail = "staff@vanguard.com";

    const fetchMessages = async () => {
        if (!userEmail) return;
        try {
            // backend::get_messages_handler (GET /api/messages)
            // polling happens every 5s further down
            const res = await fetch(`${API_BASE_URL}/api/messages?email=${encodeURIComponent(userEmail)}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !userEmail || sending) return;
        setSending(true);
        setSending(true);
        try {
            // backend::send_message_handler (POST /api/messages)
            const res = await fetch(`${API_BASE_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: userEmail,
                    receiver: staffEmail,
                    content: newMessage
                })
            });
            if (res.ok) {
                setNewMessage("");
                fetchMessages();
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
                        <Avatar sx={{ bgcolor: 'primary.main', color: 'black', mr: 2, fontWeight: 'bold' }}>S</Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Staff Support</Typography>
                            <Typography variant="caption" color="primary">Online</Typography>
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
                            const isMe = msg.sender_email === userEmail;
                            return (
                                <Box
                                    key={i}
                                    sx={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%'
                                    }}
                                >
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
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            );
                        })
                    )}
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 2, pb: 11, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(5,6,8,0.5)' }}>
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
                        <BottomNavigationAction label="Chat" icon={<ChatIcon />} />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper>
            </Box>
        </ThemeProvider>
    );
}
