import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import './css/SearchResults.css';

function SearchResults() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').trim();
    const [offers, setOffers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setOffers([]);
            return;
        }

        async function search() {
            setLoading(true);
            setError('');
            
            try {
                const res = await fetch(`/api/browse/search?q=${encodeURIComponent(query)}`,
                                        { credentials: 'include' });
                const data = await res.json();
                if (!res.ok) {
                    setError('Search failed.');
                } else {
                    setOffers(data);
                }
            } catch {
                setError('Search failed');
            } finally {
                setLoading(false);
            }
        }
        search();
    }, [query]);

    return (
        <div className="page-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
                <div className="navbar-actions">
                    <button className="auth-btn" onClick={() => navigate('/employee-profile')}>
                        Go to My Profile
                    </button>
                </div>
            </nav>

            <div className="search-results-page">
                <button className="search-results-back-btn" onClick={() => navigate('/browse')}>
                    ← Back to Browse
                </button>

                <h1 className="search-results-title">
                    {query ? `Results for "${query}"` : 'Search'}
                </h1>

                {!query && <p className="search-results-status">No search query provided.</p>}
                {loading && <p className="search-results-status">Searching...</p>}
                {error && <p className="search-results-status error-text">{error}</p>}
                {query && !loading && !error && offers.length === 0 && (
                    <p className="search-results-status">No job offers found for "{query}".</p>
                )}

                <div className="search-results-list">
                    {offers.map((offer) => (
                        <div key={offer.id} className="search-result-card">
                            <h2 className="search-result-card-title">{offer.title}</h2>
                            <p className="search-result-card-employer">{offer.business_name}</p>
                            <p className="search-result-card-location">{offer.work_location}</p>
                            <p className="search-result-card-salary">€{offer.salary} / month</p>
                            <p className="search-result-card-period">{offer.start_date?.slice(0, 10)} — {offer.end_date?.slice(0, 10)}</p>
                            <div className="search-result-card-actions">
                                <button
                                    className="search-result-card-btn-view"
                                    onClick={() => navigate(`/browse/${offer.id}`)}
                                >
                                    View Details
                                </button>
                                <button className="search-result-card-btn-apply">
                                    Apply
                                </button>
                            </div>
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

export default SearchResults;