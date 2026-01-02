"use client";

import { useState, useRef, useEffect } from "react";
import {
    Box, Typography, Button, CircularProgress,
    IconButton, Paper, Stack
} from "@mui/material";
import { CloudUpload, Delete, CheckCircle, Description, ErrorOutline, Visibility } from "@mui/icons-material";
import { API_BASE_URL } from "@/lib/config";

interface VaccinationUploadProps {
    initialUrl?: string;
    onUploadSuccess: (url: string) => void;
    label?: string;
}

export function VaccinationUpload({ initialUrl, onUploadSuccess, label = "Vaccination Records" }: VaccinationUploadProps) {
    const [fileName, setFileName] = useState<string | null>(initialUrl ? initialUrl.split('/').pop() || "Record" : null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (initialUrl) {
            setFileName(initialUrl.split('/').pop() || "Record");
        } else {
            setFileName(null);
        }
    }, [initialUrl]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setError(null);

        // 1. Size Validation (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("File must be smaller than 10MB");
            return;
        }

        // 2. Type Validation
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError("Only PDF or Images (JPG, PNG) are allowed.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const token = localStorage.getItem('vanguard_token');
            const response = await fetch(`${API_BASE_URL}/api/upload/secure`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                signal: controller.signal
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Upload failed");
            }

            const data = await response.json();
            setFileName(file.name);
            onUploadSuccess(data.url);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error("Upload Error Object:", err);
            // DEBUG: Show the raw error message to the user to identify if it's browser or server
            const errMsg = err.message || "Unknown error";
            console.log(`[DEBUG] Upload Catch: ${errMsg} (Type: ${typeof err})`);
            setError(`Debug: ${errMsg}`);
        } finally {
            if (abortControllerRef.current === controller) {
                setUploading(false);
                abortControllerRef.current = null;
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFileName(null);
        onUploadSuccess("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, display: "block", fontWeight: "bold", letterSpacing: 1 }}>
                {label.toUpperCase()}
            </Typography>

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: error ? "1px solid #ef4444" : "1px dashed rgba(212, 175, 55, 0.3)",
                    borderRadius: 3,
                    cursor: uploading ? "wait" : "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        bgcolor: "rgba(255,255,255,0.04)",
                        borderColor: error ? "#ef4444" : "#D4AF37",
                    }
                }}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                />

                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{
                        width: 48, height: 48,
                        borderRadius: 2,
                        bgcolor: fileName ? 'rgba(74, 222, 128, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {uploading ? (
                            <CircularProgress size={24} sx={{ color: "#D4AF37" }} />
                        ) : fileName ? (
                            <Description sx={{ color: "#4ade80" }} />
                        ) : (
                            <CloudUpload sx={{ color: "rgba(212, 175, 55, 0.4)" }} />
                        )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        {error ? (
                            <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 'bold' }}>{error}</Typography>
                        ) : fileName ? (
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }} noWrap>{fileName}</Typography>
                                <Typography variant="caption" sx={{ color: "#4ade80", display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CheckCircle sx={{ fontSize: 12 }} /> Encrypted & Stored
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tap to upload medical proof</Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>PDF, JPG, PNG (Max 10MB)</Typography>
                            </Box>
                        )}
                    </Box>

                    {fileName && !uploading && (
                        <IconButton size="small" onClick={handleRemove} sx={{ color: "text.secondary", "&:hover": { color: "#ef4444" } }}>
                            <Delete fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            </Paper>

            {fileName && initialUrl && (
                <Button
                    fullWidth
                    size="small"
                    variant="text"
                    startIcon={<Visibility />}
                    sx={{ mt: 1, color: 'primary.main', textTransform: 'none' }}
                    onClick={() => {
                        const token = localStorage.getItem('vanguard_token');
                        fetch(`${API_BASE_URL}${initialUrl}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                            .then(res => res.blob())
                            .then(blob => {
                                const url = window.URL.createObjectURL(blob);
                                window.open(url);
                            });
                    }}
                >
                    View Current Record
                </Button>
            )}
        </Box>
    );
}
