import { useState } from 'react';
import DOMPurify from 'dompurify';
import { jsPDF } from 'jspdf';

export default function ResumeGenerator() {
    const [jobDescription, setJobDescription] = useState('');
    const [tone, setTone] = useState('professional');
    const [maxBullets, setMaxBullets] = useState(4);
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getN8nUrl = () => {
        return localStorage.getItem('n8n_url') || 'http://localhost:5678';
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResume(null);

        try {
            const n8nUrl = getN8nUrl();

            const response = await fetch(`${n8nUrl}/webhook/generate-resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({
                    job_description: jobDescription,
                    tone: tone,
                    max_bullets_per_role: maxBullets
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
            }

            const responseText = await response.text();

            if (!responseText || responseText.trim() === '') {
                throw new Error('Empty response from server. Check n8n workflow.');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Parse error:', parseError.message);
                console.error('Response:', responseText);
                throw new Error(`Invalid JSON response: ${parseError.message}`);
            }

            if (data.html_resume) {
                setResume(data);
            } else {
                throw new Error('Resume generation failed - no html_resume in response');
            }
        } catch (err) {
            console.error('Full error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            let yPos = margin;

            // Helper to add text
            const addText = (text, size, bold = false, color = [0, 0, 0]) => {
                pdf.setFontSize(size);
                pdf.setFont('helvetica', bold ? 'bold' : 'normal');
                pdf.setTextColor(...color);
                const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                lines.forEach(line => {
                    if (yPos > 270) { pdf.addPage(); yPos = margin; }
                    pdf.text(line, margin, yPos);
                    yPos += size * 0.4;
                });
                yPos += 2;
            };

            const addSection = (title) => {
                yPos += 3;
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(51, 51, 51);
                pdf.text(title, margin, yPos);
                yPos += 1;
                pdf.setLineWidth(0.5);
                pdf.setDrawColor(51, 51, 51);
                pdf.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 6;
            };

            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(resume.html_resume, 'text/html');

            // Header - Name
            const name = doc.querySelector('h1')?.textContent || '';
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(name, pageWidth / 2, yPos, { align: 'center' });
            yPos += 8;

            // Contact
            const contact = doc.querySelector('header p')?.textContent || '';
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(102, 102, 102);
            pdf.text(contact, pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;

            // Summary
            addSection('SUMMARY');
            const summary = doc.querySelector('section:nth-of-type(1) p')?.textContent || '';
            addText(summary, 11);

            // Experience
            addSection('EXPERIENCE');
            const experiences = doc.querySelectorAll('section:nth-of-type(2) > div');
            experiences.forEach(exp => {
                const title = exp.querySelector('h3')?.textContent || '';
                const meta = exp.querySelector('p')?.textContent || '';
                addText(title, 11, true);
                addText(meta, 10, false, [102, 102, 102]);

                const bullets = exp.querySelectorAll('li');
                bullets.forEach(bullet => {
                    const text = bullet.textContent.replace('•', '').trim();
                    addText('• ' + text, 11);
                });
                yPos += 3;
            });

            // Education
            addSection('EDUCATION');
            const eduItems = doc.querySelectorAll('section:nth-of-type(3) div');
            eduItems.forEach(item => {
                const degree = item.querySelector('p:first-child')?.textContent || '';
                const school = item.querySelector('p:last-child')?.textContent || '';
                addText(degree, 11, true);
                addText(school, 10, false, [102, 102, 102]);
            });

            // Certifications
            addSection('CERTIFICATIONS');
            const certItems = doc.querySelectorAll('section:nth-of-type(4) div');
            certItems.forEach(item => {
                const cert = item.querySelector('p:first-child')?.textContent || '';
                const issuer = item.querySelector('p:last-child')?.textContent || '';
                addText(cert, 11, true);
                addText(issuer, 10, false, [102, 102, 102]);
            });

            // Skills
            addSection('SKILLS');
            const skills = doc.querySelectorAll('section:nth-of-type(5) p');
            skills.forEach(skill => {
                addText(skill.textContent, 11);
            });

            // Save with professional filename
            const pdfname = doc.querySelector('h1')?.textContent || 'Resume';
            const cleanName = pdfname.replace(/[^a-zA-Z\s]/g, '').trim().replace(/\s+/g, '_');

            // Extract role from summary (first few words before "with")
            const summaryText = doc.querySelector('section:nth-of-type(1) p')?.textContent || '';
            const roleMatch = summaryText.match(/^([^.]+?)(?:\s+with|\s+specializing)/i);
            const role = roleMatch ? roleMatch[1].trim().replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, '_') : 'Professional';

            const filename = `${cleanName}_${role}.pdf`;
            pdf.save(filename);
        } catch (error) {
            console.error('PDF error:', error);
            alert('PDF generation failed. Try HTML download.');
        }
    };

    const downloadHTML = () => {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        @media print {
            body { margin: 0; padding: 0; }
        }
        @page {
            margin: 0;
            size: A4;
        }
    </style>
</head>
<body>
${resume.html_resume}
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadText = () => {
        const blob = new Blob([resume.plain_text_resume], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(resume.plain_text_resume);
        alert('✅ Copied to clipboard!');
    };

    return (
        <div className="form-container">
            <h2>Generate Interview-Ready Resume</h2>
            <div className="info-box">
                🎯 Paste any job description → Get ATS-optimized, recruiter-approved resume in 30 seconds!
            </div>

            <form onSubmit={handleGenerate}>
                <div className="form-group">
                    <label>Job Description *</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the complete job description here..."
                        style={{ minHeight: '200px' }}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Tone</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value)}>
                        <option value="professional">Professional</option>
                        <option value="confident">Confident</option>
                        <option value="technical">Technical</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Max Bullets per Job</label>
                    <input
                        type="number"
                        value={maxBullets}
                        onChange={(e) => setMaxBullets(parseInt(e.target.value))}
                        min="3"
                        max="6"
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Generating... (20-30s)' : '✨ Generate Resume'}
                </button>
            </form>

            {error && <div className="error">❌ {error}</div>}

            {resume && (
                <div className="result">
                    <div className="success">✅ Interview-ready resume generated!</div>

                    {resume.metadata && (
                        <div className="metadata-box">
                            <h3>Resume Analysis</h3>
                            <p><strong>ATS Match:</strong> {resume.metadata.ats_score_estimate || 'N/A'}</p>
                            <p><strong>Keywords Used:</strong> {resume.metadata.extracted_keywords?.length || 0}</p>
                            <p><strong>Wow Factors:</strong> {resume.metadata.wow_factors?.join(', ') || 'N/A'}</p>
                        </div>
                    )}

                    <div className="button-group">
                        <button onClick={downloadPDF} className="btn-success">📄 Save as PDF</button>
                        <button onClick={downloadHTML} className="btn-success">📝 Download HTML</button>
                        <button onClick={downloadText} className="btn-success">📃 Download Text</button>
                        <button onClick={copyToClipboard} className="btn-info">📋 Copy</button>
                    </div>

                    <div
                        id="resume-preview"
                        className="resume-display"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resume.html_resume) }}
                    />
                </div>
            )}
        </div>
    );
}
