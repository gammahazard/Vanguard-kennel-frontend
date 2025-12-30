"use client";

import { useState, useEffect } from "react";
import {
    Box, Typography, Container, Stack, Paper, Avatar, Chip,
    BottomNavigation, BottomNavigationAction, ThemeProvider, CssBaseline,
    Fab, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, Grid,
    CircularProgress, Snackbar, Alert, IconButton
} from "@mui/material";
import { Home, Pets, CalendarMonth, Person, MoreVert, Add, MedicalServices, Scale, Notes, Close, DeleteForever, ModeEdit } from "@mui/icons-material";
import { theme } from "@/lib/theme";
import { API_BASE_URL } from "@/lib/config";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function PetsView() {
    const router = useRouter();
    const [navValue, setNavValue] = useState(1); // Index 1 is Pets
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState("");
    const [succcessMsg, setSuccessMsg] = useState("");

    // Deletion state
    const [petToDelete, setPetToDelete] = useState<any | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Editing state
    const [editingPet, setEditingPet] = useState<any | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        breed: "",
        age: "",
        weight: "",
        temperament: "",
        allergies: "",
        notes: "",
        vet_name: "",
        vet_phone: "",
        image_url: ""
    });

    const handleNavChange = (newValue: number) => {
        setNavValue(newValue);
        if (newValue === 0) router.push('/client/dashboard');
        if (newValue === 2) router.push('/client/bookings');
        if (newValue === 3) router.push('/client/profile');
    };

    const fetchPets = async () => {
        setLoading(true);
        const email = localStorage.getItem('vanguard_email');
        if (!email) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/pets?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setPets(data);
            }
        } catch (err) {
            console.error("Failed to fetch pets", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleSavePet = async () => {
        const email = localStorage.getItem('vanguard_email');
        if (!email) return;

        try {
            const isEditing = !!editingPet;
            const url = isEditing ? `${API_BASE_URL}/api/pets/${editingPet.id}` : `${API_BASE_URL}/api/pets`;
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: isEditing ? editingPet.id : undefined,
                    owner_email: email,
                    name: formData.name,
                    breed: formData.breed,
                    age: parseInt(formData.age) || 0,
                    weight: parseFloat(formData.weight) || 0,
                    temperament: formData.temperament,
                    allergies: formData.allergies || null,
                    image_url: formData.image_url || null,
                    notes: formData.notes || null,
                    vet_name: formData.vet_name || null,
                    vet_phone: formData.vet_phone || null
                })
            });

            if (res.ok) {
                setSuccessMsg(isEditing ? "Pet updated successfully!" : "Pet added successfully!");
                setShowAddModal(false);
                setEditingPet(null);
                setFormData({
                    name: "", breed: "", age: "", weight: "", temperament: "", allergies: "",
                    notes: "", vet_name: "", vet_phone: "", image_url: ""
                });
                fetchPets();
            } else {
                const errorData = await res.json().catch(() => ({}));
                setSuccessMsg(`Failed to save pet: ${errorData.error || "Unknown Error"}`);
            }
        } catch (err) {
            console.error(err);
            setSuccessMsg(`Failed to save pet (Network/Client): ${err}`);
        }
    };

    const startEdit = (pet: any) => {
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
        setShowAddModal(true);
    };

    const handleDeletePet = async () => {
        if (!petToDelete) return;
        const email = localStorage.getItem('vanguard_email');
        if (!email) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/pets/${petToDelete.id}?email=${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setSuccessMsg("Pet removed successfully.");
                setShowDeleteConfirm(false);
                setPetToDelete(null);
                fetchPets();
            } else {
                const errorData = await res.json().catch(() => ({}));
                setError(`Failed to remove pet: ${errorData.error || "Unknown Error"}`);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to remove pet: ${err}`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>

                {/* Header */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(5, 6, 8, 0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">My Pets</Typography>
                        <Chip label={`${pets.length} VIPs`} size="small" sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', fontWeight: 'bold' }} />
                    </Stack>
                </Paper>

                <Container maxWidth="sm" sx={{ pt: 2 }}>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}><CircularProgress color="primary" /></Box>
                    ) : pets.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3 }}>
                            <Pets sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" gutterBottom>No Pets Found</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Add your first "Digital Dog" to verify them for bookings.
                            </Typography>
                            <Button variant="outlined" startIcon={<Add />} onClick={() => setShowAddModal(true)}>
                                Add Pet
                            </Button>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {pets.map((pet) => (
                                <PetCard
                                    key={pet.id}
                                    pet={pet}
                                    onEdit={() => startEdit(pet)}
                                    onDelete={() => {
                                        setPetToDelete(pet);
                                        setShowDeleteConfirm(true);
                                    }}
                                />
                            ))}
                        </Stack>
                    )}

                </Container>

                {/* FAB */}
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 90, right: 24, bgcolor: '#D4AF37', '&:hover': { bgcolor: '#b5952f' } }}
                    onClick={() => setShowAddModal(true)}
                >
                    <Add />
                </Fab>

                {/* Add/Edit Pet Modal */}
                <Dialog open={showAddModal} onClose={() => {
                    setShowAddModal(false);
                    setEditingPet(null);
                    setFormData({
                        name: "", breed: "", age: "", weight: "", temperament: "", allergies: "",
                        notes: "", vet_name: "", vet_phone: "", image_url: ""
                    });
                }} PaperProps={{ sx: { bgcolor: '#1A1B1F', borderRadius: 3 } }}>
                    <DialogTitle>{editingPet ? "Edit VIP Profile" : "Add New VIP"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText color="text.secondary" sx={{ mb: 2 }}>
                            Create a digital profile for your pet.
                        </DialogContentText>
                        <Stack spacing={2}>
                            <TextField
                                label="Name" fullWidth variant="filled"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <TextField
                                label="Breed" fullWidth variant="filled"
                                value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                            />
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Age (Years)" fullWidth variant="filled" type="number"
                                    value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                />
                                <TextField
                                    label="Weight (kg)" fullWidth variant="filled" type="number"
                                    value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <TextField
                                    label="Photo URL (Optional)" fullWidth variant="filled" placeholder="https://example.com/dog.jpg"
                                    value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                                <Button disabled variant="outlined" sx={{ height: 56, minWidth: 100 }}>
                                    Upload
                                </Button>
                            </Stack>
                            <TextField
                                label="Temperament (e.g. Friendly, Shy)" fullWidth variant="filled"
                                value={formData.temperament} onChange={(e) => setFormData({ ...formData, temperament: e.target.value })}
                            />
                            <TextField
                                label="Allergies (Optional)" fullWidth variant="filled"
                                value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                            />

                            <Typography variant="caption" color="primary" sx={{ pt: 1, fontWeight: 'bold' }}>MEDICAL & VET INFO</Typography>

                            <TextField
                                label="Medical Notes" fullWidth variant="filled" multiline rows={2}
                                value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Vet Name" fullWidth variant="filled"
                                    value={formData.vet_name} onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
                                />
                                <TextField
                                    label="Vet Phone" fullWidth variant="filled"
                                    value={formData.vet_phone} onChange={(e) => setFormData({ ...formData, vet_phone: e.target.value })}
                                />
                            </Stack>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setShowAddModal(false)} color="inherit">Cancel</Button>
                        <Button onClick={handleSavePet} variant="contained" sx={{ bgcolor: '#D4AF37', color: 'black' }}>
                            Save Profile
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
                    <Alert severity="error" variant="filled">{error}</Alert>
                </Snackbar>
                <Snackbar open={!!succcessMsg} autoHideDuration={4000} onClose={() => setSuccessMsg("")}>
                    <Alert severity="success" variant="filled">{succcessMsg}</Alert>
                </Snackbar>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} PaperProps={{ sx: { bgcolor: '#1A1B1F', borderRadius: 3 } }}>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeleteForever color="error" /> Remove VIP?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText color="text.secondary">
                            Are you sure you want to remove <strong>{petToDelete?.name}</strong>? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setShowDeleteConfirm(false)} color="inherit" disabled={isDeleting}>Cancel</Button>
                        <Button
                            onClick={handleDeletePet}
                            variant="contained"
                            color="error"
                            disabled={isDeleting}
                            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isDeleting ? "Removing..." : "Remove Pet"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Bottom Nav */}
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
            </Box>
        </ThemeProvider>
    );
}

function PetCard({ pet, onEdit, onDelete }: any) {
    return (
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                    size="small"
                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    onClick={onEdit}
                >
                    <ModeEdit fontSize="small" />
                </IconButton>
                <IconButton
                    size="small"
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    onClick={onDelete}
                >
                    <Close fontSize="small" />
                </IconButton>
            </Stack>

            <Stack direction="row" alignItems="center" gap={2} mb={2}>
                <Avatar src={pet.image_url} sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 'bold' }}>{pet.name[0]}</Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{pet.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{pet.breed}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {pet.age} Years Old
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="At Home" size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }} />
                </Stack>
            </Stack>

            <Stack spacing={1}>
                {/* Visual Stats */}
                <Stack direction="row" spacing={1}>
                    <Box sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Scale fontSize="small" color="disabled" />
                        <Typography variant="body2" color="text.secondary">{pet.weight} kg</Typography>
                    </Box>
                    <Box sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Pets fontSize="small" color="disabled" />
                        <Typography variant="body2" color="text.secondary" noWrap>{pet.temperament}</Typography>
                    </Box>
                </Stack>

                {/* Vet / Medical */}
                {(pet.vet_name || pet.notes) && (
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                            <MedicalServices fontSize="small" color="primary" sx={{ mt: 0.3 }} />
                            <Box>
                                {pet.vet_name && <Typography variant="caption" display="block" color="text.secondary">Vet: {pet.vet_name} {pet.vet_phone && `(${pet.vet_phone})`}</Typography>}
                                {pet.notes && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>"{pet.notes}"</Typography>}
                            </Box>
                        </Stack>
                    </Box>
                )}

                {/* Allergies Warning */}
                {pet.allergies && (
                    <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 1, borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="error" fontWeight="bold">⚠️ Allergies:</Typography>
                            <Typography variant="caption" color="error">{pet.allergies}</Typography>
                        </Stack>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
}
