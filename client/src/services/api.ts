import { AuthService } from './auth';

export class ApiClient {
    private readonly baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }

    private async fetch(path: string, options: RequestInit = {}) {
        const apiKey = AuthService.getApiKey();
        if (!apiKey && !path.startsWith('/auth/')) {
            window.location.href = '/login';
            throw new Error('Not authenticated');
        }

        const url = `${this.baseUrl}${path}`;
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...(options.headers || {})
        });

        if (apiKey) {
            headers.set('X-API-Key', apiKey);
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            AuthService.clearApiKey();
            window.location.href = '/login';
            throw new Error('Session expired');
        }

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return response.json();
    }

    async getPlays(limit: number = 50, offset: number = 0) {
        return this.fetch(`/plays?limit=${limit}&offset=${offset}`);
    }

    async recordPlay(play: any) {
        return this.fetch('/track/play', {
            method: 'POST',
            body: JSON.stringify(play)
        });
    }

    async testAuth() {
        return this.fetch('/');
    }
}

// Initialize the API client
export const api = new ApiClient('http://localhost:8000');
