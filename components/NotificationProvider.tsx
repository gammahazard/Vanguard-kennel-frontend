"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { API_BASE_URL } from '@/lib/config';

interface NotificationContextType {
    showNotification: (message: string, severity?: AlertColor) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
    return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<AlertColor>("info");
    const [lastNotifId, setLastNotifId] = useState<string | null>(null);

    const showNotification = (msg: string, sev: AlertColor = "info") => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    // Global Polling for new notifications
    useEffect(() => {
        const email = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email') : null;
        if (!email) return;

        const checkNotifications = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/notifications?email=${encodeURIComponent(email)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        const latest = data[0];
                        // If it's a new, unread notification that we haven't toasted yet
                        if (!latest.is_read && latest.id !== lastNotifId) {
                            setLastNotifId(latest.id);
                            showNotification(`${latest.title}: ${latest.content}`, "info");
                        }
                    }
                }
            } catch (err) {
                console.error("Notif Poll failed", err);
            }
        };

        const interval = setInterval(checkNotifications, 10000); // Check every 10s
        checkNotifications(); // Immediate check

        return () => clearInterval(interval);
    }, [lastNotifId]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%', borderRadius: 3, fontWeight: 'bold' }}>
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};
