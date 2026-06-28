import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import './css/JobOfferDetailEmployee.css';

function JobOfferDetailEmployee() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const res = await fetch(`/api/browse/${id}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Failed to load job offer.');
                } else {
                    setOffer(data);
                }
            } catch (err) {
                setError('Something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        fetchOffer();
    }, [id]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="page-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
                <div className="navbar-actions">
                    <button className="auth-btn" onClick={() => navigate('/browse')}>
                        Back to Browse
                    </button>
                </div>
            </nav>

            <div className="job-offer-detail-page">

                {loading && <p>Loading...</p>}
                {error && <p className="detail-error">{error}</p>}

                {!loading && !error && offer && (
                    <>
                        <div className="detail-header">
                            <div>
                                <h1 className="detail-title">{offer.title}</h1>
                                <span className={`status-badge ${offer.status === 'open' ? 'status-open' : 'status-closed'}`}>
                                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                                </span>
                            </div>
                            <div className="detail-actions">
                                <button className="edit-btn" onClick={() => navigate(`/browse/${id}/apply`)}>
                                    Apply
                                </button>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h2 className="detail-section-title">Job Details</h2>
                            <div className="detail-grid">
                                <div className="detail-field">
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value">{offer.work_location}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="detail-label">Salary</span>
                                    <span className="detail-value">€{offer.salary}/mo</span>
                                </div>
                                <div className="detail-field">
                                    <span className="detail-label">Working Hours</span>
                                    <span className="detail-value">{offer.working_hours}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="detail-label">Positions Available</span>
                                    <span className="detail-value">{offer.positions_available}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="detail-label">Start Date</span>
                                    <span className="detail-value">{formatDate(offer.start_date)}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="detail-label">End Date</span>
                                    <span className="detail-value">{formatDate(offer.end_date)}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="detail-label">Posted</span>
                                    <span className="detail-value">{formatDate(offer.created_at)}</span>
                                </div>
                            </div>
                            <div className="detail-field detail-field-full">
                                <span className="detail-label">Description</span>
                                <p className="detail-description">{offer.description}</p>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h2 className="detail-section-title">Accommodation</h2>
                            <div className="detail-grid">
                                <div className="detail-field">
                                    <span className="detail-label">Type</span>
                                    <span className="detail-value">{offer.accommodation_type}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value">{offer.accommodation_location}</span>
                                </div>
                            </div>
                            {offer.additional_info && (
                                <div className="detail-field detail-field-full">
                                    <span className="detail-label">Additional Info</span>
                                    <p className="detail-description">{offer.additional_info}</p>
                                </div>
                            )}
                        </div>

                        <div className="detail-section">
                            <h2 className="detail-section-title">Required Documents</h2>
                            {offer.required_documents.length === 0 ? (
                                <p className="detail-empty">No required documents listed.</p>
                            ) : (
                                <ul className="detail-list">
                                    {offer.required_documents.map(doc => (
                                        <li key={doc.id} className="detail-list-item">
                                            <span className="detail-list-name">{doc.document_name}</span>
                                            {doc.description && (
                                                <span className="detail-list-desc">{doc.description}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="detail-section">
                            <h2 className="detail-section-title">Language Requirements</h2>
                            {offer.language_requirements.length === 0 ? (
                                <p className="detail-empty">No language requirements listed.</p>
                            ) : (
                                <ul className="detail-list">
                                    {offer.language_requirements.map(lang => (
                                        <li key={lang.id} className="detail-list-item">
                                            <span className="detail-list-name">{lang.language}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        {offer.images && offer.images.length > 0 && (
                            <div className="detail-section">
                                <h2 className="detail-section-title">Photos</h2>
                                <div className="detail-images">
                                    {offer.images.map(img => (
                                        <img
                                            key={img.id}
                                            src={`http://88.200.63.148:30052/${img.file}`}
                                            alt="Job offer"
                                            className="detail-image"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
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

export default JobOfferDetailEmployee;