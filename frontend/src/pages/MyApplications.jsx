import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './css/MyApplications.css';

function MyApplications() {
    const navigate = useNavigate()
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadApplications() {
            try {
                const res = await fetch('/api/applications/my', {
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
    }, []);

    const handleWithdraw = async (applicationId) => {
        try {
            const res = await fetch(`/api/applications/${applicationId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                return;
            }
            const updated = await fetch('/api/applications/my', {
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
                    <button className="auth-btn" onClick={() => navigate('/employee-profile-view')}>
                        Go to My Profile
                    </button>
                </div>
            </nav>

            <div className="my-applications-content">
                <div className="my-applications-header">
                    <h2 className="my-applications-title">My Applications</h2>
                    <button className="btn-browse" onClick={() => navigate('/browse')}>
                        Back to Browse
                    </button>
                </div>

                {error && <p className="my-applications-error">{error}</p>}

                {applications.length === 0 && !error && (
                    <p className="my-applications-status">You have not submitted any applications yet.</p>
                )}

                <div className="my-applications-list">
                    {applications.map(app => (
                        <div className="application-card" key={app.id}>
                            <div className="application-card-header">
                                <h3 className="application-job-title">{app.title}</h3>
                                <span className={`application-status status-${app.status}`}>
                                    {app.status}
                                </span>
                            </div>
                            <p className="application-employer">{app.business_name}</p>
                            <p className="application-location">{app.work_location}</p>
                            <p className="application-dates">
                                {formatDate(app.start_date)} — {formatDate(app.end_date)}
                            </p>
                            <p className="application-submitted">
                                Submitted: {formatDate(app.submitted_at)}
                            </p>
                            {app.status !== 'accepted' && app.status !== 'withdrawn' && (
                                <button
                                    className="btn-withdraw"
                                    onClick={() => handleWithdraw(app.id)}
                                >
                                    Withdraw
                                </button>
                            )}
                        </div>
                    ))}
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

export default MyApplications;