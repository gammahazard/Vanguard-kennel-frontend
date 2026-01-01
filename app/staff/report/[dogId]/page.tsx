"use client";

import { Box, Typography, Container, Paper, Stack, TextField, Button, Chip, Tabs, Tab, CircularProgress, IconButton } from "@mui/material";
import {
    CloudUpload,
    Pets,
    SportsBaseball,
    Bed,
    Restaurant,
    CheckCircle,
    ArrowBack
} from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function CreateReportCard({ params }: { params: { dogId: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [mood, setMood] = useState("Happy");
    const [activity, setActivity] = useState("Played Fetch");
    const [notes, setNotes] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [ateBreakfast, setAteBreakfast] = useState("Pending");
    const [ateDinner, setAteDinner] = useState("Pending");
    const [playtimeStatus, setPlaytimeStatus] = useState("Pending");

    const moods = ["Happy", "Energetic", "Shy", "Cuddly", "Anxious"];
    const activities = ["Played Fetch", "Nap Time", "Group Play", "Puzzler", "Snack Time"];
    const mealStatuses = ["Ate 100%", "Ate 75%", "Ate 50%", "Ate 25%", "Skipped", "Pending"];
    const playtimeStatuses = ["Full Group", "Individual", "Relaxed", "Pending"];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("vanguard_token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: params.dogId, // Using dogId as proxy for booking_id for demo simplicity, or we'd look up the active booking
                    mood,
                    activity,
                    image_url: imageUrl,
                    notes,
                    ate_breakfast: ateBreakfast,
                    ate_dinner: ateDinner,
                    playtime_status: playtimeStatus
                })
            });

            if (res.ok) {
                // Success
                router.push('/staff/dashboard');
            } else {
                console.error("Failed to submit report");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="md">

                {/* Header */}
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <IconButton onClick={() => router.back()} sx={{ color: 'text.secondary' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight="bold">
                            DAILY UPDATE
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            Digital Report Card
                        </Typography>
                    </Box>
                </Stack>

                <Stack spacing={4}>

                    {/* Photo Upload Section */}
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                            1. Capture the Moment 📸
                        </Typography>
                        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                            <ImageUpload
                                onUploadSuccess={(url) => setImageUrl(url)}
                                initialUrl={imageUrl || undefined}
                            />
                        </Paper>
                    </Box>

                    {/* Mood Selector */}
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                            2. Today&apos;s Mood 🎭
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                            {moods.map(m => (
                                <Chip
                                    key={m}
                                    label={m}
                                    clickable
                                    onClick={() => setMood(m)}
                                    sx={{
                                        bgcolor: mood === m ? 'primary.main' : 'rgba(255,255,255,0.05)',
                                        color: mood === m ? 'white' : 'text.secondary',
                                        fontWeight: 'bold',
                                        border: '1px solid',
                                        borderColor: mood === m ? 'primary.main' : 'rgba(255,255,255,0.1)',
                                        '&:hover': { bgcolor: mood === m ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Activity Selector */}
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                            3. Top Activity 🎾
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {activities.map(a => (
                                <Chip
                                    key={a}
                                    label={a}
                                    clickable
                                    onClick={() => setActivity(a)}
                                    icon={<CheckCircle sx={{ fontSize: '16px !important', display: activity === a ? 'block' : 'none' }} />}
                                    sx={{
                                        bgcolor: activity === a ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: activity === a ? '#34d399' : 'text.secondary',
                                        fontWeight: 'bold',
                                        border: '1px solid',
                                        borderColor: activity === a ? '#10b981' : 'rgba(255,255,255,0.1)',
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Meal Tracking */}
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Restaurant sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                                4. Meal Compliance 🥣
                            </Typography>
                        </Stack>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>BREAKFAST STATUS</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {mealStatuses.map(s => (
                                        <Chip
                                            key={s}
                                            label={s}
                                            clickable
                                            onClick={() => setAteBreakfast(s)}
                                            sx={{
                                                bgcolor: ateBreakfast === s ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                                                color: ateBreakfast === s ? '#34d399' : 'text.secondary',
                                                border: '1px solid',
                                                borderColor: ateBreakfast === s ? '#10b981' : 'rgba(255,255,255,0.1)',
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>DINNER STATUS</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {mealStatuses.map(s => (
                                        <Chip
                                            key={s}
                                            label={s}
                                            clickable
                                            onClick={() => setAteDinner(s)}
                                            sx={{
                                                bgcolor: ateDinner === s ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                                                color: ateDinner === s ? '#34d399' : '#94a3b8',
                                                border: '1px solid',
                                                borderColor: ateDinner === s ? '#10b981' : 'rgba(255,255,255,0.1)',
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Playtime Detail */}
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <SportsBaseball sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                                5. Playtime Quality 🎾
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {playtimeStatuses.map(s => (
                                <Chip
                                    key={s}
                                    label={s}
                                    clickable
                                    onClick={() => setPlaytimeStatus(s)}
                                    sx={{
                                        bgcolor: playtimeStatus === s ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: playtimeStatus === s ? '#60a5fa' : '#94a3b8',
                                        border: '1px solid',
                                        borderColor: playtimeStatus === s ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Notes */}
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                            4. Staff Notes 📝
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="How did they do today? Any incidents or funny moments?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                '& .MuiOutlinedInput-root': { borderRadius: 3 }
                            }}
                        />
                    </Box>

                    {/* Submit */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={loading || !imageUrl}
                        sx={{ py: 2, borderRadius: 3, fontSize: '1.rem', fontWeight: 'bold' }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Send to Client"}
                    </Button>

                </Stack>
            </Container>
        </Box>
    );
}
