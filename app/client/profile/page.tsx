"use client";

import { useState, useEffect } from "react";
import {
    Box, Typography, Container, Stack, Paper, Avatar,
    BottomNavigation, BottomNavigationAction, ThemeProvider, CssBaseline,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListItemSecondaryAction, Switch, Divider, Button, Alert, Snackbar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import { Home, Pets, CalendarMonth, Person, Face, Notifications, CreditCard, Security, ChevronRight, Logout, CheckCircle, Cancel } from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { startRegistration } from '@simplewebauthn/browser';
import { API_BASE_URL } from "@/lib/config";

export default function ProfileView() {
    const router = useRouter();
    const [userName, setUserName] = useState("Guest");
    const [navValue, setNavValue] = useState(3);
    const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(false);
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false); // Guard against double-clicks
    const [message, setMessage] = useState({ text: "", severity: "info", open: false });
    const [showAuditDialog, setShowAuditDialog] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const handleOpenAudit = () => {
        const email = localStorage.getItem('vanguard_email');
        if (email) {
            fetch(`${API_BASE_URL}/api/user/security-logs?email=${encodeURIComponent(email)}`)
                .then(res => res.json())
                .then(data => setAuditLogs(data))
                .catch(err => console.error("Failed to fetch logs", err));
        }
        setShowAuditDialog(true);
    };

    useEffect(() => {
        const storedName = localStorage.getItem('vanguard_user');
        const email = localStorage.getItem('vanguard_email');
        if (storedName) setUserName(storedName);

        // Fetch actual status from backend to force-sync the slider
        if (email) {
            console.log("🔍 Checking Face ID status for:", email);
            fetch(`${API_BASE_URL}/api/auth/check?email=${encodeURIComponent(email)}`)
                .then(res => {
                    if (!res.ok) throw new Error("Status check failed");
                    return res.json();
                })
                .then(data => {
                    console.log("✅ Face ID status received:", data);
                    if (data.faceid_registered) {
                        setIsFaceIdEnabled(true);
                        localStorage.setItem('vanguard_faceid_enabled', 'true');
                    } else {
                        setIsFaceIdEnabled(false);
                        localStorage.setItem('vanguard_faceid_enabled', 'false');
                    }
                })
                .catch(err => console.error("❌ Error checking Face ID status:", err));
        }
    }, []);

    const handleNavChange = (newValue: number) => {
        setNavValue(newValue);
        if (newValue === 0) router.push('/client/dashboard');
        if (newValue === 1) router.push('/client/pets');
        if (newValue === 2) router.push('/client/bookings');
    };

    const handleFaceIdToggle = async () => {
        if (isRegistering) return; // Prevent race conditions

        // If already enabled, show "Are you sure?" dialog instead of just toggling
        if (isFaceIdEnabled) {
            setShowDeactivateDialog(true);
            return;
        }

        setIsRegistering(true);
        try {
            const email = localStorage.getItem('vanguard_email');
            if (!email) {
                setMessage({ text: "Please log in again to register Face ID.", severity: "error", open: true });
                return;
            }

            console.log("🚀 Starting Face ID Registration for:", email);

            // 1. Get challenge
            const resStart = await fetch(`${API_BASE_URL}/api/auth/webauthn/register/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!resStart.ok) {
                const errData = await resStart.text();
                throw new Error(`Server rejected registration start: ${errData}`);
            }

            const options = await resStart.json();
            console.log("📦 Challenge received:", options);

            // 2. Browser prompt
            console.log("🔔 Opening Biometric Prompt...");
            let attResp;
            try {
                // Standardize the options for the browser
                const authOptions = options.publicKey || options;

                // CRITICAL: Remove extra fields that are NOT part of the WebAuthn spec
                const cleanOptions = { ...authOptions };
                if (cleanOptions.challenge_id) delete (cleanOptions as any).challenge_id;

                attResp = await startRegistration(cleanOptions);
            } catch (promptErr: any) {
                console.error("❌ Biometric Prompt Crash:", promptErr);
                throw new Error(`Biometric prompt failed: ${promptErr.message || "Unknown error"}`);
            }

            console.log("✅ Biometric Response received:", attResp);

            // 3. Verify
            const resFinish = await fetch(`${API_BASE_URL}/api/auth/webauthn/register/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge_id: options.challenge_id, response: attResp })
            });

            if (resFinish.ok) {
                setIsFaceIdEnabled(true);
                localStorage.setItem('vanguard_faceid_enabled', 'true');
                setMessage({ text: "Face ID Registered Successfully!", severity: "success", open: true });
            } else {
                const errFinish = await resFinish.text();
                throw new Error(`Server verification failed: ${errFinish}`);
            }

        } catch (err: any) {
            console.error("🆘 Registration Error:", err);
            setMessage({ text: err.message || "Registration failed", severity: "error", open: true });
        }
    };

    const handleConfirmDeactivate = async () => {
        setShowDeactivateDialog(false);
        try {
            const email = localStorage.getItem('vanguard_email');
            if (!email) return;

            const res = await fetch(`${API_BASE_URL}/api/auth/webauthn/unregister?email=${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setIsFaceIdEnabled(false);
                localStorage.setItem('vanguard_faceid_enabled', 'false');
                setMessage({ text: "Face ID has been disabled.", severity: "info", open: true });
            } else {
                throw new Error("Failed to unregister on server");
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to disable Face ID. Please try again.", severity: "error", open: true });
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <Typography variant="h6" fontWeight="bold">Account Profile</Typography>
                </Paper>

                <Container maxWidth="sm" sx={{ pt: 4 }}>
                    <Stack spacing={4}>
                        <Stack alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 'bold', mb: 1 }}>
                                {userName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h5" fontWeight="bold">{userName}</Typography>
                            <Typography variant="body2" color="text.secondary">Elite Member</Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ ml: 1 }}>Security & Access</Typography>
                            <Paper sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                                <List disablePadding>
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={handleFaceIdToggle}>
                                            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}><Face /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight="500">Face ID Login</Typography>}
                                                secondary={<Typography variant="caption" color="text.secondary">Use biometrics for quick access</Typography>}
                                            />
                                            <ListItemSecondaryAction>
                                                <Switch
                                                    edge="end"
                                                    color="primary"
                                                    checked={isFaceIdEnabled}
                                                    onChange={handleFaceIdToggle}
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItemButton>
                                    </ListItem>
                                    <Divider sx={{ opacity: 0.05 }} />
                                    <SettingsItem icon={<Notifications />} title="Push Notifications" hasSwitch={true} defaultChecked />
                                    <Divider sx={{ opacity: 0.05 }} />
                                    <SettingsItem
                                        icon={<Security />}
                                        title="Security Audit"
                                        subtitle="View recent login activity"
                                        onClick={handleOpenAudit}
                                    />
                                </List>
                            </Paper>
                        </Stack>

                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Logout />}
                            onClick={() => {
                                // Surgical clear: Keep identity, remove session
                                localStorage.removeItem('vanguard_token');
                                localStorage.removeItem('vanguard_role');
                                localStorage.removeItem('vanguard_user');
                                // WE KEEP: vanguard_email and vanguard_faceid_enabled
                                router.push('/client/login');
                            }}
                            fullWidth
                            sx={{ py: 1.5, borderRadius: 3, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                        >
                            Sign Out
                        </Button>
                    </Stack>
                </Container>

                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={navValue}
                        onChange={(event, newValue) => handleNavChange(newValue)}
                        sx={{ bgcolor: '#0B0C10', height: 70, '& .Mui-selected': { color: '#D4AF37 !important' } }}
                    >
                        <BottomNavigationAction label="Home" icon={<Home />} />
                        <BottomNavigationAction label="Pets" icon={<Pets />} />
                        <BottomNavigationAction label="Bookings" icon={<CalendarMonth />} />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper>

                <Dialog
                    open={showDeactivateDialog}
                    onClose={() => setShowDeactivateDialog(false)}
                    PaperProps={{ sx: { borderRadius: 3, bgcolor: '#1A1B1F' } }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Disable Face ID?</DialogTitle>
                    <DialogContent>
                        <DialogContentText color="text.secondary">
                            Are you sure you want to disable Face ID? You will need to use your password to log in next time.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setShowDeactivateDialog(false)} color="inherit">Cancel</Button>
                        <Button onClick={handleConfirmDeactivate} variant="contained" color="error" sx={{ borderRadius: 2 }}>
                            Disable Face ID
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={showAuditDialog}
                    onClose={() => setShowAuditDialog(false)}
                    PaperProps={{ sx: { borderRadius: 3, bgcolor: '#1A1B1F', minWidth: 350 } }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Security Audit Log</DialogTitle>
                    <DialogContent>
                        <DialogContentText color="text.secondary" sx={{ mb: 2 }}>
                            Recent login attempts and security events for your account.
                        </DialogContentText>
                        <List>
                            {auditLogs.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" align="center">No logs found.</Typography>
                            ) : (
                                auditLogs.map((log) => (
                                    <ListItem key={log.id} disablePadding sx={{ mb: 1 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            {log.action.includes("FAILURE") ?
                                                <Cancel color="error" fontSize="small" /> :
                                                <CheckCircle color="success" fontSize="small" />
                                            }
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight="500">{log.action.replace(/_/g, " ")}</Typography>}
                                            secondary={
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="caption" color="text.secondary">{new Date(log.timestamp + "Z").toLocaleString()}</Typography>
                                                    {log.ip_address && (
                                                        <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 0.5, borderRadius: 1, fontFamily: 'monospace' }}>
                                                            {log.ip_address}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            }
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setShowAuditDialog(false)} color="primary">Close</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={message.open}
                    autoHideDuration={6000}
                    onClose={() => setMessage({ ...message, open: false })}
                >
                    <Alert severity={message.severity as any} variant="filled" sx={{ width: '100%' }}>
                        {message.text}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}

function SettingsItem({ icon, title, subtitle, hasSwitch, defaultChecked, onClick }: any) {
    return (
        <ListItem disablePadding>
            <ListItemButton onClick={onClick}>
                <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>{icon}</ListItemIcon>
                <ListItemText
                    primary={<Typography variant="body2" fontWeight="500">{title}</Typography>}
                    secondary={subtitle ? <Typography variant="caption" color="text.secondary">{subtitle}</Typography> : null}
                />
                <ListItemSecondaryAction>
                    {hasSwitch ? (
                        <Switch edge="end" color="primary" defaultChecked={defaultChecked} />
                    ) : (
                        <ChevronRight sx={{ color: 'text.secondary', fontSize: 20 }} />
                    )}
                </ListItemSecondaryAction>
            </ListItemButton>
        </ListItem>
    );
}
