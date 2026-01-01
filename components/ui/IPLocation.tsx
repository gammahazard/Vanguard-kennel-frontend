"use client";

import { useState, useEffect } from "react";
import { Typography } from "@mui/material";

const ipLocationCache: Record<string, string> = {};

interface IPLocationProps {
    ip: string;
    showIp?: boolean;
}

export default function IPLocation({ ip, showIp = true }: IPLocationProps) {
    const [location, setLocation] = useState<string | null>(ipLocationCache[ip] || null);

    useEffect(() => {
        if (location || !ip || ip === "Unknown IP" || ip === "127.0.0.1" || ip === "localhost") return;

        if (ipLocationCache[ip]) {
            setLocation(ipLocationCache[ip]);
            return;
        }

        const timer = setTimeout(() => {
            fetch(`https://ipwho.is/${ip}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const loc = `${data.city}, ${data.country_code}`;
                        ipLocationCache[ip] = loc;
                        setLocation(loc);
                    }
                })
                .catch(err => console.error("IP Geo failed", err));
        }, Math.random() * 200);

        return () => clearTimeout(timer);
    }, [ip, location]);

    return (
        <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 0.5, borderRadius: 1, fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            {showIp && ip} {location && <span style={{ opacity: 0.7 }}>({location})</span>}
            {!location && !["Unknown IP", "127.0.0.1", "localhost"].includes(ip) && <span style={{ opacity: 0.5, fontSize: '0.8em' }}>...</span>}
        </Typography>
    );
}
