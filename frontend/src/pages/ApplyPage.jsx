import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import './css/ApplyPage.css';

function ApplyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jobOffer, setJobOffer] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadOffer() {
            try {
                const res = await fetch(`/api/browse/${id}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error);
                    return;
                }
                setJobOffer(data);
                setFiles(new Array(data.required_documents.length).fill(null));
            } catch {
                setError('Failed to load job offer');
            } finally {
                setLoading(false);
            }
        }
        loadOffer();
    }, [id]);

    const handleFileChange = (index, file) => {
        const updated = [...files];
        updated[index] = file;
        setFiles(updated);
    };

    const handleSubmit = async () => {
        setError('');

        const allFilled = files.every(f => f !== null);
        if (!allFilled) {
            setError('Please upload a file for every required document.');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('job_offer_id', id);
            files.forEach(file => formData.append('documents', file));

            const res = await fetch('/api/applications', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                setSubmitting(false);
                return;
            }

            navigate('/my-applications');
        } catch {
            setError('Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) return <p className="job-offers-status">Loading...</p>;

    return (
        <div className="page-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
                <div className="navbar-actions">
                    <button className="auth-btn" onClick={() => navigate('/employer-profile-view')}>
                        Go to My Profile
                    </button>
                </div>
            </nav>

                <div className="apply-page">
                    <div className="apply-card">
                        <button className="btn-back" onClick={() => navigate(`/browse/${id}`)}>Back</button>
                        <h2 className="apply-title">Apply for: {jobOffer.title}</h2>
                        <p className="apply-subtitle">Upload the required documents below.</p>

                        <div className="apply-documents">
                            {jobOffer.required_documents.map((doc, index) => (
                                <div className="apply-document-item" key={doc.id}>
                                    <p className="document-name">{doc.document_name}</p>
                                    {doc.description && (
                                        <p className="document-description">{doc.description}</p>
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                                    />
                                </div>
                            ))}
                        </div>

                        {error && <p className="apply-error">{error}</p>}

                        <button
                            className="btn-submit"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </div>
            <footer className="footer">
                <span className="footer-brand">LetoCroatia</span>
                <div className="footer-links">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Cookie Policy</span>
                    <span>Contact Support</span>
                </div>
            </footer>
        </div>
    )
}

export default ApplyPage;