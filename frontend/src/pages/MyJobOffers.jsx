import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/MyJobOffers.css';

function MyJobOffers() {
    const [jobOffers, setJobOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobOffers = async () => {
            try {
                const res = await fetch('/api/job-offers/my', {
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Failed to load job offers.');
                } else {
                    setJobOffers(data);
                }
            } catch (err) {
                setError('Something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobOffers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job offer?')) return;

        try {
            const res = await fetch(`/api/job-offers/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setJobOffers(jobOffers.filter(offer => offer.id !== id));
            } else {
                alert(data.error || 'Failed to delete job offer.');
            }
        } catch (err) {
            alert('Something went wrong.');
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="page-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
                <div className="navbar-actions">
                    <button className="auth-btn" onClick={() => navigate('/employer-profile')}>
                        Go to My Profile
                    </button>
                </div>
            </nav>

            <div className="my-job-offers-page">
                <div className="my-job-offers-header">
                    <h1 className="my-job-offers-title">My Job Offers</h1>
                    <button
                        className="create-offer-btn"
                        onClick={() => navigate('/job-offers/create')}
                    >
                        + Create New Job Offer
                    </button>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p className="no-offers-msg">{error}</p>}

                {!loading && !error && jobOffers.length === 0 && (
                    <p className="no-offers-msg">You have not created any job offers yet.</p>
                )}

                {!loading && !error && jobOffers.length > 0 && (
                    <table className="job-offers-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Location</th>
                                <th>Salary</th>
                                <th>Period</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobOffers.map(offer => (
                                <tr key={offer.id}>
                                    <td>{offer.title}</td>
                                    <td>{offer.work_location}</td>
                                    <td>€{offer.salary}/mo</td>
                                    <td>{formatDate(offer.start_date)} - {formatDate(offer.end_date)}</td>
                                    <td>
                                        <span className={`status-badge ${offer.status === 'open' ? 'status-open' : 'status-closed'}`}>
                                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="table-action-btn"
                                            onClick={() => navigate(`/job-offers/${offer.id}`)}
                                        >
                                            View
                                        </button>
                                        {' | '}
                                        <button
                                            className="table-action-btn"
                                            onClick={() => navigate(`/job-offers/${offer.id}/edit`)}
                                        >
                                            Edit
                                        </button>
                                        {' | '}
                                        <button
                                            className="table-action-btn"
                                            onClick={() => handleDelete(offer.id)}
                                        >
                                            Delete
                                        </button>
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

export default MyJobOffers;