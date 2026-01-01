import { Paper, Typography, Box } from "@mui/material";

interface Stat {
    label: string;
    value: string;
    color: string;
}

interface OperationsStatsProps {
    stats?: Stat[];
}

const DEFAULT_STATS = [
    { label: "Guests In House", value: "14", color: "primary.main" },
    { label: "Check-Ins Today", value: "3", color: "text.primary" },
    { label: "Departures", value: "5", color: "text.secondary" },
    { label: "Pending Playtime", value: "8", color: "#ef4444" },
];

export default function OperationsStats({ stats = DEFAULT_STATS }: OperationsStatsProps) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {stats.map((kpi, i) => (
                <Paper key={i} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: kpi.color }}>
                        {kpi.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {kpi.label}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
}
