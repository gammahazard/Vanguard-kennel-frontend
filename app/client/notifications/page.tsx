"use client";

import { useState, useEffect } from "react";
import {
    Box, Typography, Container, Stack, Paper, IconButton, Badge,
    CircularProgress, ThemeProvider, CssBaseline, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, Divider, Button
} from "@mui/material";
import {
    ArrowBack, Notifications, CheckCircle, Info,
    Campaign, Pets, EventAvailable, Cancel
} from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

export default function NotificationsView() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        const email = localStorage.getItem('vanguard_email');
        if (!email) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PUT' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            }
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (type: string, title: string) => {
        if (title.includes("Confirmed")) return <EventAvailable sx={{ color: '#4caf50' }} />;
        if (title.includes("Cancelled")) return <Cancel sx={{ color: '#f44336' }} />;
        if (type === 'system') return <Info sx={{ color: '#2196f3' }} />;
        return <Campaign sx={{ color: '#ff9800' }} />;
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
                {/* Header */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton onClick={() => router.back()} sx={{ color: 'white' }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>Inbox</Typography>
                        <Badge badgeContent={notifications.filter(n => !n.is_read).length} color="error">
                            <Notifications sx={{ color: 'text.secondary' }} />
                        </Badge>
                    </Stack>
                </Paper>

                <Container maxWidth="sm" sx={{ pt: 2 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={8}><CircularProgress color="primary" /></Box>
                    ) : notifications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                            <Notifications sx={{ fontSize: 80, mb: 2 }} />
                            <Typography variant="h6">No Notifications</Typography>
                            <Typography variant="body2">When staff send updates or your bookings change, they'll appear here.</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {notifications.map((notif) => (
                                <Paper
                                    key={notif.id}
                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: notif.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(212, 175, 55, 0.05)',
                                        border: notif.is_read ? '1px solid rgba(255,255,255,0.05)' : '1px solid #D4AF37',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    <Stack direction="row" spacing={2}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                                            {getIcon(notif.notification_type, notif.title)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Typography variant="subtitle2" fontWeight="bold" color={notif.is_read ? 'text.primary' : '#D4AF37'}>
                                                    {notif.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {notif.content}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
}
