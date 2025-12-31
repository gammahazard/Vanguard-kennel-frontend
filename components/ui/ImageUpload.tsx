"use client";

import { useState, useRef } from "react";
import {
    Box, Typography, Button, CircularProgress,
    IconButton, Avatar, Stack
} from "@mui/material";
import { CloudUpload, Delete, CheckCircle, AddPhotoAlternate, ErrorOutline } from "@mui/icons-material";
import { API_BASE_URL } from "@/lib/config";

interface ImageUploadProps {
    initialUrl?: string;
    onUploadSuccess: (url: string) => void;
    label?: string;
}

export function ImageUpload({ initialUrl, onUploadSuccess, label = "VIP Portrait" }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(initialUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Cancel previous upload if still running
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setError(null);

        // 1. Client-side Size Validation (7MB)
        if (file.size > 7 * 1024 * 1024) {
            setError("Image must be smaller than 7MB");
            return;
        }

        // 2. Client-side Type Validation
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }

        // Create local preview instantly (synchronous)
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // 3. Upload to Backend
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        // Create a new AbortController for this request
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: "POST",
                body: formData,
                signal: controller.signal
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Upload failed");
            }

            const data = await response.json();
            onUploadSuccess(data.url);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log("Upload aborted due to new selection");
                return; // Silence abort errors
            }
            console.error("Upload Error:", err);
            setError(err.message || "Failed to upload image");
            setPreview(initialUrl || null); // Reset preview on failure
        } finally {
            if (abortControllerRef.current === controller) {
                setUploading(false);
                abortControllerRef.current = null;
            }
            // Cleanup object URL to prevent memory leaks
            URL.revokeObjectURL(objectUrl);
        }
    };

    const handleRemove = () => {
        setPreview(null);
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
                    transition: "all 0.3s ease",
                    "&:hover": {
                        bgcolor: "rgba(255,255,255,0.04)",
                        borderColor: error ? "#ef4444" : "#D4AF37",
                    }
                }}
            >
                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                />

                <Stack direction="row" spacing={3} alignItems="center">
                    <Box sx={{ position: "relative" }}>
                        <Avatar
                            src={preview || ""}
                            variant="rounded"
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: "rgba(212, 175, 55, 0.1)",
                                border: "1px solid rgba(212, 175, 55, 0.2)",
                                borderRadius: 2
                            }}
                        >
                            {!preview && <AddPhotoAlternate sx={{ fontSize: 30, color: "rgba(212, 175, 55, 0.4)" }} />}
                        </Avatar>
                        {uploading && (
                            <Box sx={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                bgcolor: "rgba(0,0,0,0.5)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 2
                            }}>
                                <CircularProgress size={24} sx={{ color: "#D4AF37" }} />
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        {error ? (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "#ef4444", mb: 1 }}>
                                <ErrorOutline fontSize="small" />
                                <Typography variant="caption">{error}</Typography>
                            </Stack>
                        ) : preview && !uploading ? (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "#4ade80", mb: 1 }}>
                                <CheckCircle fontSize="small" />
                                <Typography variant="caption" sx={{ fontWeight: "bold" }}>Ready for Vanguard Profile</Typography>
                            </Stack>
                        ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                JPG, PNG or WebP. Max 7MB.
                            </Typography>
                        )}

                        <Stack direction="row" spacing={1}>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                startIcon={<CloudUpload />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    borderColor: "rgba(212,175,55,0.5)",
                                    color: "#D4AF37",
                                    "&:hover": { borderColor: "#D4AF37" }
                                }}
                            >
                                {preview ? "Change Photo" : "Upload Photo"}
                            </Button>
                            {preview && !uploading && (
                                <IconButton
                                    size="small"
                                    onClick={handleRemove}
                                    sx={{ color: "text.secondary", "&:hover": { color: "#ef4444" } }}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}

import { Paper } from "@mui/material";
