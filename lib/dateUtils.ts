export function formatDateTimeEST(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    // Ensure valid date
    if (isNaN(date.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

export function formatTimeEST(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}
