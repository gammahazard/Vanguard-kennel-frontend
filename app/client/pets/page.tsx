"use client";

import { useState, useEffect } from "react";
import {
    Box, Typography, Container, Stack, Paper, Chip,
    BottomNavigation, BottomNavigationAction, ThemeProvider, CssBaseline,
    Fab, Avatar, Grid, IconButton, Button,
    CircularProgress, Snackbar, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Divider,
    DialogContentText, Skeleton
} from "@mui/material";
import {
    Home, Pets, CalendarMonth, ModeEdit, Close, Warning, Notes,
    Add, Scale, Info, MedicalServices, Chat, Person, ArrowForward,
    DeleteForever
} from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { API_BASE_URL } from "@/lib/config";
import { sanitizeInput, sanitizePhone } from "@/lib/security";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function PetsView() {
    const router = useRouter();
    const [navValue, setNavValue] = useState(1);
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingPet, setEditingPet] = useState<any>(null);
    const [petToDelete, setPetToDelete] = useState<any>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        breed: "",
        age: "",
        weight: "",
        temperament: "Friendly",
        allergies: "",
        notes: "",
        vet_name: "",
        vet_phone: "",
        image_url: ""
    });
    const [customTemp, setCustomTemp] = useState("");

    const handleNavChange = (newValue: number) => {
        setNavValue(newValue);
        if (newValue === 0) router.push('/client/dashboard');
        if (newValue === 2) router.push('/client/bookings');
        if (newValue === 3) router.push('/client/messenger');
        if (newValue === 4) router.push('/client/profile');
    };

    const fetchPets = async () => {
        setLoading(true);
        const email = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email') : null;
        if (!email) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/pets?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setPets(data);
            }
        } catch (err) {
            console.error("Fetch pets failed", err);
            setError("Failed to sync your VIP inventory.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleAddPet = async () => {
        setSubmitting(true);
        const email = typeof window !== 'undefined' ? localStorage.getItem('vanguard_email') : null;
        try {
            const res = await fetch(`${API_BASE_URL}/api/pets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner_email: email,
                    ...formData,
                    temperament: formData.temperament === 'Other' ? customTemp : formData.temperament,
                    age: parseInt(formData.age) || 0,
                    weight: parseFloat(formData.weight) || 0.0
                })
            });

            if (res.ok) {
                setSuccess(`${formData.name} is now a Vanguard VIP! 🍾`);
                setOpenAdd(false);
                setFormData({ name: "", breed: "", age: "", weight: "", temperament: "Friendly", allergies: "", notes: "", vet_name: "", vet_phone: "", image_url: "" });
                fetchPets();
            } else {
                const errorData = await res.json();
                setError(`Failed to save: ${errorData.error || "Unknown error"}`);
            }
        } catch (err) {
            setError("Network error. Could not reach Vanguard Command.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePet = async () => {
        if (!editingPet) return;
        setSubmitting(true);
        const email = localStorage.getItem('vanguard_email');
        try {
            const res = await fetch(`${API_BASE_URL}/api/pets/${editingPet.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingPet.id,
                    owner_email: email,
                    ...formData,
                    temperament: formData.temperament === 'Other' ? customTemp : formData.temperament,
                    age: parseInt(formData.age) || 0,
                    weight: parseFloat(formData.weight) || 0.0
                })
            });

            if (res.ok) {
                setSuccess(`${formData.name}'s profile updated!`);
                setOpenEdit(false);
                setEditingPet(null);
                fetchPets();
            } else {
                const errorData = await res.json();
                setError(`Failed to save: ${errorData.error || "Check your data"}`);
            }
        } catch (err) {
            setError(`Network error: ${err instanceof Error ? err.message : "Connection failed"}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePet = async () => {
        if (!petToDelete) return;
        setSubmitting(true);
        const email = localStorage.getItem('vanguard_email');
        try {
            const res = await fetch(`${API_BASE_URL}/api/pets/${petToDelete.id}?email=${encodeURIComponent(email || "")}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setSuccess("VIP profile removed.");
                setOpenDelete(false);
                setPetToDelete(null);
                fetchPets();
            } else {
                const errorData = await res.json();
                setError(`Failed to remove: ${errorData.error || "Try again"}`);
            }
        } catch (err) {
            setError(`Failed to remove: ${err instanceof Error ? err.message : "Connection error"}`);
        } finally {
            setSubmitting(false);
        }
    };

    const openEditDialog = (pet: any) => {
        setEditingPet(pet);
        setFormData({
            name: pet.name,
            breed: pet.breed,
            age: pet.age.toString(),
            weight: pet.weight.toString(),
            temperament: pet.temperament,
            allergies: pet.allergies || "",
            notes: pet.notes || "",
            vet_name: pet.vet_name || "",
            vet_phone: pet.vet_phone || "",
            image_url: pet.image_url || ""
        });
        setCustomTemp(pet.temperament && !['Friendly', 'Relaxed', 'Energetic', 'Protective', 'Anxious'].includes(pet.temperament) ? pet.temperament : "");
        if (pet.temperament && !['Friendly', 'Relaxed', 'Energetic', 'Protective', 'Anxious'].includes(pet.temperament)) {
            setFormData(prev => ({ ...prev, temperament: 'Other' }));
        }
        setOpenEdit(true);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
                {/* Header */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h6" fontWeight="bold">My Pets</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(212, 175, 55, 0.6)', fontStyle: 'italic', fontSize: 10 }}>
                                &quot;Exquisite care for your Very Important Pet (VIP)&quot;
                            </Typography>
                        </Box>
                        <Chip label={`${pets.length} VIPs`} size="small" sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', fontWeight: 'bold' }} />
                    </Stack>
                </Paper>

                <Container maxWidth="sm" sx={{ pt: 2 }}>
                    {loading ? (
                        <Stack spacing={2.5}>
                            {[1, 2, 3].map(i => (
                                <Paper key={i} sx={{ p: 0, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <Stack direction="row" spacing={0}>
                                        <Skeleton variant="rectangular" width={40} height={200} sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)' }} />
                                        <Box sx={{ flex: 1, p: 2.5 }}>
                                            <Stack direction="row" spacing={2} mb={3}>
                                                <Skeleton variant="rectangular" width={90} height={90} sx={{ borderRadius: 2 }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Skeleton width="40%" height={20} />
                                                    <Skeleton width="70%" height={32} />
                                                    <Skeleton width="50%" height={20} />
                                                </Box>
                                            </Stack>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 4 }}><Skeleton height={40} /></Grid>
                                                <Grid size={{ xs: 4 }}><Skeleton height={40} /></Grid>
                                                <Grid size={{ xs: 4 }}><Skeleton height={40} /></Grid>
                                            </Grid>
                                        </Box>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    ) : pets.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                            <Pets sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.2, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No VIPs registered yet</Typography>
                            <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenAdd(true)} sx={{ mt: 2 }}>Register Pet</Button>
                        </Box>
                    ) : (
                        <Stack spacing={2.5}>
                            {pets.map(pet => (
                                <PetCard
                                    key={pet.id}
                                    pet={pet}
                                    onEdit={() => openEditDialog(pet)}
                                    onDelete={() => { setPetToDelete(pet); setOpenDelete(true); }}
                                />
                            ))}
                        </Stack>
                    )}
                </Container>

                <Fab color="primary" sx={{ position: 'fixed', bottom: 90, right: 24, bgcolor: '#D4AF37' }} onClick={() => setOpenAdd(true)}>
                    <Add />
                </Fab>

                {/* Create/Edit Dialogs */}
                <Dialog open={openAdd || openEdit} onClose={() => !submitting && (openAdd ? setOpenAdd(false) : setOpenEdit(false))} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: '#1A1B1F', borderRadius: 3 } }}>
                    <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                        <Typography variant="h5" fontWeight="bold">{openAdd ? "Register VIP" : "Edit Profile"}</Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 3 }}>
                        <Stack spacing={2.5} sx={{ mt: 1 }}>
                            <ImageUpload
                                initialUrl={formData.image_url}
                                onUploadSuccess={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                            />
                            <TextField label="VIP Name" fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: sanitizeInput(e.target.value, 32) })} variant="filled" />
                            <TextField label="Breed" fullWidth value={formData.breed} onChange={e => setFormData({ ...formData, breed: sanitizeInput(e.target.value, 40) })} variant="filled" />
                            <Stack direction="row" spacing={2}>
                                <TextField label="Age" type="number" fullWidth value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} variant="filled" />
                                <TextField label="Weight (kg)" type="number" fullWidth value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} variant="filled" />
                            </Stack>
                            <TextField select label="Temperament" fullWidth value={formData.temperament} onChange={e => {
                                const val = e.target.value;
                                setFormData({ ...formData, temperament: val });
                                if (val !== 'Other') setCustomTemp(""); // Clear custom if not 'Other'
                            }} variant="filled">
                                <MenuItem value="Friendly">Friendly</MenuItem>
                                <MenuItem value="Relaxed">Relaxed</MenuItem>
                                <MenuItem value="Energetic">Energetic</MenuItem>
                                <MenuItem value="Protective">Protective</MenuItem>
                                <MenuItem value="Anxious">Anxious</MenuItem>
                                <MenuItem value="Other">Other...</MenuItem>
                            </TextField>

                            {formData.temperament === 'Other' && (
                                <TextField
                                    label="Custom Temperament"
                                    fullWidth
                                    autoFocus
                                    value={customTemp}
                                    onChange={e => {
                                        const val = sanitizeInput(e.target.value, 30);
                                        setCustomTemp(val);
                                    }}
                                    variant="filled"
                                    placeholder="e.g. Very Cuddly"
                                />
                            )}
                            <TextField label="Allergies" fullWidth value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: sanitizeInput(e.target.value, 60) })} variant="filled" placeholder="N/A" />
                            <TextField label="Medical Notes" fullWidth multiline rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: sanitizeInput(e.target.value, 500) })} variant="filled" placeholder="Medications, behavioral notes..." />
                            <Divider sx={{ my: 1, opacity: 0.1 }} />
                            <Typography variant="caption" color="primary" fontWeight="bold">EMERGENCY VETERINARY INFO</Typography>
                            <TextField label="Vet Name" fullWidth value={formData.vet_name} onChange={e => setFormData({ ...formData, vet_name: sanitizeInput(e.target.value, 50) })} variant="filled" />
                            <TextField label="Vet Phone" fullWidth value={formData.vet_phone} onChange={e => setFormData({ ...formData, vet_phone: sanitizePhone(e.target.value) })} variant="filled" />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => openAdd ? setOpenAdd(false) : setOpenEdit(false)}>Cancel</Button>
                        <Button variant="contained" onClick={openAdd ? handleAddPet : handleUpdatePet} disabled={submitting || !formData.name || !formData.breed} sx={{ bgcolor: '#D4AF37', color: 'black' }}>
                            {submitting ? <CircularProgress size={20} /> : (openAdd ? "Register" : "Save Changes")}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={openDelete} onClose={() => !submitting && setOpenDelete(false)}>
                    <DialogTitle>De-register VIP?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to remove {petToDelete?.name} from your profile? This cannot be undone.</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDelete(false)}>Wait, Keep</Button>
                        <Button color="error" onClick={handleDeletePet} disabled={submitting}>
                            {submitting ? <CircularProgress size={20} /> : "Remove Profile"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}><Alert severity="error">{error}</Alert></Snackbar>
                <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")}><Alert severity="success">{success}</Alert></Snackbar>

                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
                    <BottomNavigation showLabels value={navValue} onChange={(e, v) => handleNavChange(v)} sx={{ bgcolor: '#0B0C10', height: 70, '& .Mui-selected': { color: '#D4AF37 !important' } }}>
                        <BottomNavigationAction label="Home" icon={<Home />} />
                        <BottomNavigationAction label="Pets" icon={<Pets />} />
                        <BottomNavigationAction label="Bookings" icon={<CalendarMonth />} />
                        <BottomNavigationAction label="Chat" icon={<Chat />} />
                        <BottomNavigationAction label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper>
            </Box>
        </ThemeProvider>
    );
}

function PetCard({ pet, onEdit, onDelete }: any) {
    return (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
        }}>
            <Stack direction="row" sx={{ height: '100%' }}>
                {/* 1. LEFT "SECURITY STRIP" */}
                <Box sx={{
                    width: 40,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    overflow: 'hidden'
                }}>
                    <Typography
                        variant="caption"
                        sx={{
                            transform: 'rotate(-90deg)',
                            whiteSpace: 'nowrap',
                            color: 'black',
                            fontWeight: 900,
                            letterSpacing: 2,
                            opacity: 0.8,
                            fontSize: '0.65rem'
                        }}
                    >
                        VIP PASSPORT • {pet.id.substring(0, 8).toUpperCase()}
                    </Typography>
                </Box>

                {/* 2. MAIN CONTENT AREA */}
                <Box sx={{ flex: 1, p: 2.5, position: 'relative' }}>

                    {/* TOP SEAL */}
                    <Box sx={{
                        position: 'absolute',
                        top: 15,
                        right: 15,
                        opacity: 0.1,
                        transform: 'rotate(15deg)'
                    }}>
                        <Pets sx={{ fontSize: 80, color: 'primary.main' }} />
                    </Box>

                    {/* HEADER */}
                    <Stack direction="row" spacing={2} mb={3}>
                        <Avatar
                            src={pet.image_url ? (pet.image_url.startsWith('http') ? pet.image_url : `${API_BASE_URL}${pet.image_url}`) : ""}
                            sx={{
                                width: 90,
                                height: 90,
                                borderRadius: 2,
                                border: '2px solid rgba(212, 175, 55, 0.3)',
                                bgcolor: 'rgba(255,255,255,0.05)',
                                fontWeight: 'bold',
                                fontSize: '2.5rem'
                            }}
                        >
                            {pet.name[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.5, display: 'block' }}>REPUBLIC OF VANGUARD</Typography>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff', mb: 0.5 }}>{pet.name.toUpperCase()}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>{pet.breed}</Typography>
                        </Box>
                    </Stack>

                    {/* BIOMETRIC GRID */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 4 }} style={{ display: 'block' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>AGE</Typography>
                            <Typography variant="body1" fontWeight="bold">{pet.age} YR</Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }} style={{ display: 'block' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>WEIGHT</Typography>
                            <Typography variant="body1" fontWeight="bold">{pet.weight} KG</Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }} style={{ display: 'block' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>CLASS</Typography>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: 'primary.main' }}>VIP</Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2, opacity: 0.1 }} />

                    {/* SECURITY ICONS & STATUS */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1}>
                            {pet.allergies && (
                                <Chip
                                    icon={<Warning sx={{ fontSize: '0.8rem !important' }} />}
                                    label="ALLERGY"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    sx={{ borderRadius: 1, fontSize: '0.6rem', fontWeight: 'bold' }}
                                />
                            )}
                            {pet.notes && (
                                <Chip
                                    icon={<Notes sx={{ fontSize: '0.8rem !important' }} />}
                                    label="MEDICAL DATA PROVIDED"
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderRadius: 1, fontSize: '0.6rem', color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)', fontWeight: 'bold' }}
                                />
                            )}
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary', opacity: 0.5, '&:hover': { opacity: 1 } }}><ModeEdit fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary', opacity: 0.5, '&:hover': { color: 'error.main', opacity: 1 } }}><DeleteForever fontSize="small" /></IconButton>
                        </Stack>
                    </Stack>

                    {/* VET & EMERGENCY SECTION */}
                    {(pet.vet_name || pet.vet_phone) && (
                        <Box sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(212, 175, 55, 0.05)',
                            border: '1px dashed rgba(212, 175, 55, 0.2)'
                        }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <MedicalServices sx={{ fontSize: 14, color: 'primary.main' }} />
                                <Typography variant="caption" color="primary" fontWeight="bold" sx={{ letterSpacing: 1 }}>EMERGENCY VET</Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>{pet.vet_name || "NOT LISTED"}</Typography>
                            <Typography variant="caption" color="text.secondary">{pet.vet_phone || "No phone provided"}</Typography>
                        </Box>
                    )}

                    <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontFamily: 'monospace',
                                color: 'text.secondary',
                                opacity: 0.4,
                                display: 'block',
                                letterSpacing: 1
                            }}
                        >
                            P&lt;VGD{pet.name.toUpperCase()} &lt;&lt; {pet.breed.toUpperCase().replace(/\s/g, '')}
                        </Typography>
                    </Box>
                </Box>
            </Stack>
        </Paper>
    );
}
