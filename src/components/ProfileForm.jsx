import { useState, useEffect } from 'react';
import { saveProfile } from '../services/api';

export default function ProfileForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [summary, setSummary] = useState('');
    const [skills, setSkills] = useState('');
    const [certifications, setCertifications] = useState('');

    const [experience, setExperience] = useState([{
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        achievements: ''
    }]);

    const [education, setEducation] = useState([{
        degree: '',
        university: '',
        graduation_year: ''
    }]);

    // Load saved profile on mount
    useEffect(() => {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            try {
                const profile = JSON.parse(saved);
                setName(profile.name || '');
                setEmail(profile.email || '');
                setPhone(profile.phone || '');
                setLocation(profile.location || '');
                setLinkedin(profile.linkedin || '');
                setSummary(profile.summary || '');
                setSkills((profile.skills || []).join(', '));
                setCertifications((profile.certifications || []).join('\n'));

                if (profile.experience?.length) {
                    setExperience(profile.experience.map(exp => ({
                        ...exp,
                        achievements: Array.isArray(exp.achievements)
                            ? exp.achievements.join('\n')
                            : exp.achievements || ''
                    })));
                }

                if (profile.education?.length) {
                    setEducation(profile.education);
                }
            } catch (error) {
                console.error('Load error:', error);
            }
        }
    }, []);

    const addExperience = () => {
        setExperience([...experience, {
            title: '',
            company: '',
            start_date: '',
            end_date: '',
            achievements: ''
        }]);
    };

    const removeExperience = (index) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    const updateExperience = (index, field, value) => {
        const updated = [...experience];
        updated[index][field] = value;
        setExperience(updated);
    };

    const addEducation = () => {
        setEducation([...education, {
            degree: '',
            university: '',
            graduation_year: ''
        }]);
    };

    const removeEducation = (index) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const updateEducation = (index, field, value) => {
        const updated = [...education];
        updated[index][field] = value;
        setEducation(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formattedProfile = {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                location: location.trim(),
                linkedin: linkedin.trim(),
                summary: summary.trim(),
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
                experience: experience
                    .filter(exp => exp.title && exp.company)
                    .map(exp => ({
                        title: exp.title,
                        company: exp.company,
                        start_date: exp.start_date,
                        end_date: exp.end_date || 'Present',
                        achievements: exp.achievements
                            .split('\n')
                            .filter(a => a.trim())
                    })),
                education: education
                    .filter(edu => edu.degree && edu.university)
                    .map(edu => ({
                        degree: edu.degree,
                        university: edu.university,
                        graduation_year: edu.graduation_year
                    })),
                certifications: certifications.split('\n').filter(c => c.trim())
            };

            // Validate
            if (!formattedProfile.name || !formattedProfile.email) {
                setMessage('❌ Name and Email are required!');
                setLoading(false);
                return;
            }

            const result = await saveProfile(formattedProfile);

            if (result.success) {
                localStorage.setItem('userProfile', JSON.stringify(formattedProfile));
                setMessage('✅ Profile saved successfully!');
            } else {
                setMessage('❌ ' + result.message);
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Your Profile Information</h2>
            <div className="info-box">
                💡 Fill this once. Saved locally and used for all resumes.
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Phone</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>LinkedIn</label>
                    <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Professional Summary *</label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Skills (comma separated) *</label>
                    <textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Python, AWS, Docker, Kubernetes"
                        required
                    />
                </div>

                <h3>Experience</h3>
                {experience.map((exp, index) => (
                    <div key={index} className="item-group">
                        {experience.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeExperience(index)}
                                className="btn-remove"
                            >
                                ×
                            </button>
                        )}
                        <input
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        />
                        <input
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        />
                        <input
                            type="month"
                            placeholder="Start Date"
                            value={exp.start_date}
                            onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                        />
                        <input
                            type="month"
                            placeholder="End Date"
                            value={exp.end_date}
                            onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                        />
                        <textarea
                            placeholder="Achievements (one per line)"
                            value={exp.achievements}
                            onChange={(e) => updateExperience(index, 'achievements', e.target.value)}
                        />
                    </div>
                ))}
                <button type="button" onClick={addExperience} className="btn-secondary">
                    + Add Experience
                </button>

                <h3>Education</h3>
                {education.map((edu, index) => (
                    <div key={index} className="item-group">
                        {education.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeEducation(index)}
                                className="btn-remove"
                            >
                                ×
                            </button>
                        )}
                        <input
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        />
                        <input
                            placeholder="University"
                            value={edu.university}
                            onChange={(e) => updateEducation(index, 'university', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Year"
                            value={edu.graduation_year}
                            onChange={(e) => updateEducation(index, 'graduation_year', e.target.value)}
                        />
                    </div>
                ))}
                <button type="button" onClick={addEducation} className="btn-secondary">
                    + Add Education
                </button>

                <div className="form-group">
                    <label>Certifications (one per line)</label>
                    <textarea
                        value={certifications}
                        onChange={(e) => setCertifications(e.target.value)}
                        placeholder="AWS Certified Solutions Architect - 2023"
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : '💾 Save Profile'}
                </button>

                {message && <div className={message.includes('✅') ? 'success' : 'error'}>{message}</div>}
            </form>
        </div>
    );
}
