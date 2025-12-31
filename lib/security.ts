/**
 * Vanguard Security Utilities
 * Centralized sanitization for premium safety.
 */

export const sanitizeInput = (val: string, maxLength: number = 255): string => {
    if (!val) return "";

    return val
        .substring(0, maxLength)
        .replace(/[<>]/g, "") // Strip HTML-like tags
        .trim();
};

export const sanitizePhone = (val: string): string => {
    return val.replace(/[^\d+-\s()]/g, "").substring(0, 20);
};

export const sanitizePrice = (val: string): number => {
    const cleaned = val.replace(/[^\d.]/g, "");
    return parseFloat(cleaned) || 0;
};
