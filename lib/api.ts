import { API_BASE_URL } from "./config";

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const authenticatedFetch = async (endpoint: string, options: FetchOptions = {}) => {
    // 1. Get Token
    const token = typeof window !== 'undefined' ? localStorage.getItem('vanguard_token') : null;

    // 2. Prepare Headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Make Request
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // 4. Handle Auth Failures globally
        if (response.status === 401) {
            console.warn("⚠️ Unauthorized! Redirecting to login...");
            if (typeof window !== 'undefined') {
                // Determine user role to redirect correctly (fallback to staff if unknown)
                // We're not decoding the token here for simplicity, just safe fallback
                const role = localStorage.getItem('vanguard_role');
                if (role === 'client') {
                    // Wait a moment so we don't loop if it's a momentary glitch, but usually immediate
                    window.location.href = '/login';
                } else {
                    window.location.href = '/staff/login';
                }
            }
        }

        return response;
    } catch (error) {
        console.error("Authenticated Fetch Error:", error);
        throw error;
    }
};
