import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Stack, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, IconButton, CircularProgress, Alert, Chip, InputAdornment
} from "@mui/material";
import { Edit, Save, Cancel, AttachMoney, Store } from "@mui/icons-material";
import { Service, EnrichedBooking } from "@/types"; // EnrichedBooking not needed but keeping for consistency if extended
import { authenticatedFetch, API_BASE_URL } from "@/lib/api";

interface ServiceManagerProps {
    services?: Service[];
    loading?: boolean;
    onUpdatePrice?: (id: string, price: number) => void;
}

export default function ServiceManager({ services: propServices, loading: propLoading, onUpdatePrice }: ServiceManagerProps) {
    const [localServices, setLocalServices] = useState<Service[]>([]);
    const [localLoading, setLocalLoading] = useState(true);

    const services = propServices || localServices;
    const loading = propLoading !== undefined ? propLoading : localLoading;

    const [editService, setEditService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ price: 0, description: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!propServices) fetchServices();
    }, [propServices]);

    const fetchServices = async () => {
        setLocalLoading(true);
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/services`);
            if (res.ok) {
                setLocalServices(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleEdit = (service: Service) => {
        setEditService(service);
        setFormData({ price: service.price, description: service.description || "" });
    };

    const handleSave = async () => {
        if (!editService) return;
        setSaving(true);
        setError("");

        if (onUpdatePrice) {
            try {
                await onUpdatePrice(editService.id, Number(formData.price));
                setEditService(null);
            } catch (e) {
                setError("Failed to update via parent");
            } finally {
                setSaving(false);
            }
            return;
        }

        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/api/services/${editService.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    price: Number(formData.price),
                    description: formData.description
                })
            });
            if (res.ok) {
                fetchServices();
                setEditService(null);
            } else {
                setError("Failed to update service");
            }
        } catch (e) {
            console.error(e);
            setError("Connection error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Store sx={{ color: '#D4AF37' }} /> Service Management
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={24} sx={{ color: '#D4AF37' }} />
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
                    {services.map((service) => (
                        <Paper key={service.id} sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(212, 175, 55, 0.3)' }
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{service.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">ID: {service.id.slice(0, 8)}...</Typography>
                                </Box>
                                <Chip
                                    label={`$${service.price}`}
                                    sx={{
                                        bgcolor: 'rgba(212, 175, 55, 0.1)',
                                        color: '#D4AF37',
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}
                                    icon={<AttachMoney sx={{ fontSize: 16, color: '#D4AF37 !important' }} />}
                                />
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mb: 2 }}>
                                {service.description || "No description provided."}
                            </Typography>

                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<Edit />}
                                onClick={() => handleEdit(service)}
                                sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { borderColor: '#D4AF37', color: '#D4AF37' } }}
                            >
                                Edit Pricing
                            </Button>
                        </Paper>
                    ))}
                </Box>
            )}

            {/* EDIT DIALOG */}
            <Dialog
                open={!!editService}
                onClose={() => setEditService(null)}
                PaperProps={{
                    sx: { borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', minWidth: 400 }
                }}
            >
                {editService && (
                    <>
                        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            Edit {editService.name}
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            <Stack spacing={3} sx={{ mt: 1 }}>
                                {error && <Alert severity="error">{error}</Alert>}

                                <TextField
                                    label="Price"
                                    type="number"
                                    fullWidth
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                                />

                                <TextField
                                    label="Description"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <Button onClick={() => setEditService(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                sx={{ bgcolor: '#D4AF37', color: 'black', '&:hover': { bgcolor: '#b5932b' } }}
                            >
                                Save Changes
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
