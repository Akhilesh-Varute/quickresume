import { useState } from 'react';
import { getN8nUrl, setN8nUrl, getProfile } from '../services/api';

export default function Settings() {
    const [url, setUrl] = useState(getN8nUrl());
    const [message, setMessage] = useState('');

    const handleSave = () => {
        setN8nUrl(url);
        setMessage('✅ Settings saved!');
        setTimeout(() => setMessage(''), 3000);
    };

    const testConnection = async () => {
        setMessage('Testing...');
        try {
            const result = await getProfile();
            if (result.success && result.profile) {
                setMessage(`✅ Connected! Profile: ${result.profile.name}`);
            } else {
                setMessage('⚠️ Connected but no profile found');
            }
        } catch (error) {
            setMessage('❌ Connection failed: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Configuration</h2>
            <div className="warning">
                ⚠️ Make sure n8n is running with CORS enabled
            </div>

            <div className="form-group">
                <label>n8n URL *</label>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="http://localhost:5678"
                />
            </div>

            <div className="button-group">
                <button onClick={handleSave} className="btn-primary">💾 Save</button>
                <button onClick={testConnection} className="btn-secondary">🔍 Test</button>
            </div>

            {message && <div className={message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}>{message}</div>}
        </div>
    );
}
