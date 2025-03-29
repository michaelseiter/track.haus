const API_KEY_STORAGE_KEY = 'track_haus_api_key';

export class AuthService {
    static getApiKey(): string | null {
        return localStorage.getItem(API_KEY_STORAGE_KEY);
    }

    static setApiKey(apiKey: string): void {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    }

    static clearApiKey(): void {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
    }

    static isAuthenticated(): boolean {
        return !!this.getApiKey();
    }
}
