import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import './css/JobApplications.css';

function JobApplications() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadApplications() {
            try {
                const res = await fetch(`/api/applications/job-offer/${id}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error);
                    return;
                }
                setApplications(data);
            } catch {
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        }
        loadApplications();
    }, [id]);

    const handleStatus = async (applicationId, status) => {
        try {
            const res = await fetch(`/api/applications/${applicationId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                return
            }
            const updated = await fetch(`/api/applications/job-offer/${id}`, {
                credentials: 'include'
            });
            const updatedData = await updated.json();
            setApplications(updatedData);
        } catch {
            setError('Something went wrong. Please try again.');
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB');
    };

    if (loading) return <p>Loading...</p>;

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

            <div className="job-applications-content">
                <div className="job-applications-header">
                    <h2 className="job-applications-title">Applications</h2>
                    <button className="btn-back-offer" onClick={() => navigate(`/job-offers/${id}`)}>
                        Back to Job Offer
                    </button>
                </div>

                {error && <p className="job-applications-error">{error}</p>}

                {applications.length === 0 && !error && (
                    <p className="job-applications-status">No applications have been submitted for this job offer yet.</p>
                )}

                {applications.length > 0 && (
                    <table className="job-applications-table">
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Nationality</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th>Documents</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.id}>
                                    <td>{app.first_name} {app.last_name}</td>
                                    <td>{app.nationality}</td>
                                    <td>{formatDate(app.submitted_at)}</td>
                                    <td>
                                        <span className={`application-status status-${app.status}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>
                                        {app.documents && app.documents.length > 0 ? (
                                            app.documents.map((doc, index) => (
                                                <a
                                                    key={index}
                                                    href={`http://88.200.63.148:30052/${doc.file}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="doc-link"
                                                >
                                                    {doc.document_name}</a>
                                            ))
                                        ) : (
                                            <span>No documents</span>
                                        )}
                                    </td>
                                    <td>
                                        {app.status !== 'withdrawn' && (
                                            <>
                                                <button
                                                    className="btn-accept"
                                                    onClick={() => handleStatus(app.id, 'accepted')}
                                                    disabled={app.status === 'accepted'}
                                                >
                                                    Accept
                                                </button>
                                                {' | '}
                                                <button
                                                    className="btn-reject"
                                                    onClick={() => handleStatus(app.id, 'rejected')}
                                                    disabled={app.status === 'rejected'}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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

export default JobApplications;