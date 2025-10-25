import { useState } from 'react';
import ProfileForm from './components/ProfileForm';
import ResumeGenerator from './components/ResumeGenerator';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Smart Resume Generator</h1>
        <p>AI-Powered Resume Tailoring | Save Once, Generate Unlimited Times</p>
      </header>

      <div className="tabs">
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          📝 My Profile
        </button>
        <button className={activeTab === 'generate' ? 'active' : ''} onClick={() => setActiveTab('generate')}>
          ✨ Generate Resume
        </button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
          ⚙️ Settings
        </button>
      </div>

      <div className="content">
        {activeTab === 'profile' && <ProfileForm />}
        {activeTab === 'generate' && <ResumeGenerator />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default App;
