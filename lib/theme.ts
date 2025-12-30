"use client";

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#D4AF37', // Gold
        },
        secondary: {
            main: '#ffffff',
        },
        background: {
            default: '#050608',
            paper: '#0B0C10',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #D4AF37 30%, #AA8C2C 90%)',
                    color: '#000',
                }
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(212, 175, 55, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#D4AF37',
                        },
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#0B0C10',
                }
            }
        }
    },
});
