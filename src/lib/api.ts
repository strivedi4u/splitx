const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://splitx.azurewebsites.net/api';

interface FetchOptions extends RequestInit {
    data?: any;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const token = localStorage.getItem('splitx_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    if (options.data) {
        config.body = JSON.stringify(options.data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result as T;
    } catch (error: any) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}
