"use client";

import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { WifiOff, Phone } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
    const router = useRouter();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#050608",
                p: 3,
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        textAlign: "center",
                        bgcolor: "#1A1B1F",
                        color: "white",
                        borderRadius: 4,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "rgba(212, 175, 55, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 3,
                            mx: "auto",
                        }}
                    >
                        <WifiOff sx={{ fontSize: 40, color: "#D4AF37" }} />
                    </Box>

                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "#D4AF37" }}>
                        You are Offline
                    </Typography>

                    <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
                        It looks like you&apos;ve lost internet connection. Check your signal or wifi.
                    </Typography>

                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Phone />}
                        href="tel:555-0199" // Emergency Line
                        sx={{
                            mb: 2,
                            borderColor: "rgba(255,255,255,0.2)",
                            color: "white",
                            "&:hover": { borderColor: "#D4AF37", color: "#D4AF37" },
                        }}
                    >
                        Call Kennel: (555) 019-9
                    </Button>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => window.location.reload()}
                        sx={{
                            bgcolor: "#D4AF37",
                            color: "black",
                            "&:hover": { bgcolor: "#bfa34b" },
                        }}
                    >
                        Try Again
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}
