
import { User, Project, PRDResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const auth = {
    async login(email: string, password: string): Promise<User> {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        localStorage.setItem('token', data.token);
        return data.user;
    },

    async signup(email: string, password: string, name: string): Promise<User> {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        if (!res.ok) throw new Error('Signup failed');
        const data = await res.json();
        localStorage.setItem('token', data.token);
        return data.user;
    },

    async logout(): Promise<void> {
        localStorage.removeItem('token');
    },

    async getCurrentUser(): Promise<User | null> {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
            if (!res.ok) {
                localStorage.removeItem('token');
                return null;
            }
            return await res.json();
        } catch {
            return null;
        }
    }
};

export const db = {
    async saveProject(data: PRDResponse): Promise<Project> {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                name: data.appName,
                summary: data.tagline,
                data: data
            })
        });
        if (!res.ok) throw new Error('Failed to save project');
        return await res.json();
    },

    async getProjects(): Promise<Project[]> {
        const res = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
        if (!res.ok) return [];
        return await res.json();
    },

    async deleteProject(id: string): Promise<void> {
        await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    }
};
