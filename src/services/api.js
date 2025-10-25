const API_BASE = localStorage.getItem('n8n_url') || 'http://localhost:5678';

export const saveProfile = async (profile) => {
    const response = await fetch(`${API_BASE}/webhook/save-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(profile)
    });
    return response.json();
};

export const getProfile = async () => {
    const response = await fetch(`${API_BASE}/webhook/get-profile`, {
        method: 'GET',
        mode: 'cors'
    });
    return response.json();
};

export const generateResume = async (data) => {
    const response = await fetch(`${API_BASE}/webhook/generate-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(data)
    });
    return response.json();
};

export const getN8nUrl = () => {
    return localStorage.getItem('n8n_url') || 'http://localhost:5678';
};

export const setN8nUrl = (url) => {
    localStorage.setItem('n8n_url', url);
};
