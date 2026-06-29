import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './css/JobOffers.css';

function JobOffers() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [offers, setOffers] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [location, setLocation] = useState('')
    const [language, setLanguage] = useState('')
    const [salaryMin, setSalaryMin] = useState('')
    const [salaryMax, setSalaryMax] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function loadOffers() {
            try {
                const res = await fetch('/api/browse/', { credentials: 'include' });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Failed to load job offers');
                } else {
                    setOffers(data);
                }
            } catch {
                setError('Failed to load job offers');
            } finally {
                setLoading(false);
            }
        }
        loadOffers();
    }, []);

    function handleFilter(e) {
        e.preventDefault();

        const params = new URLSearchParams();
        if (location) params.append('location', location);
        if (language) params.append('language', language);
        if (salaryMin) params.append('salary_min', salaryMin);
        if (salaryMax) params.append('salary_max', salaryMax);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        async function loadFiltered() {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`/api/browse/?${params.toString()}`, { credentials: 'include' });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Failed to load job offers');
                } else {
                    setOffers(data);
                }
            } catch {
                setError('Failed to load job offers');
            } finally {
                setLoading(false);
            }
        }
        loadFiltered();
    }

    function handleSearch(e) {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/browse/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }

    if (loading) return <p className="job-offers-status">Loading job offers...</p>;
    if (error) return <p className="job-offers-status error-text">{error}</p>;

    return (
        <div className="page-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
                <div className="navbar-actions">
                    <div className="browse-navbar-buttons">
                        <button className="auth-btn" onClick={() => navigate('/my-applications')}>
                            View My Applications
                        </button>
                        <button className="auth-btn" onClick={() => navigate('/employee-profile-view')}>
                            Go to My Profile
                        </button>
                    </div>
                </div>
            </nav>

            <div className="job-offers-page">
                <h1 className="job-offers-title">Browse Job Offers</h1>

                <form className="job-offers-search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search by job title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="job-offers-search-input"
                    />
                    <button type="submit" className="job-offers-search-btn">Search</button>
                </form>

                <form className="job-offers-filter-form" onSubmit={handleFilter}>
                    <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="job-offers-filter-input"/>
                    <input
                        type="text"
                        placeholder="Language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="job-offers-filter-input"
                    />
                    <input
                        type="number"
                        placeholder="Min salary"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        className="job-offers-filter-input"
                    />
                    <input
                        type="number"
                        placeholder="Max salary"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        className="job-offers-filter-input"/>
                    <input
                        type="date"
                        placeholder="Start date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="job-offers-filter-input"/>
                    <input
                        type="date"
                        placeholder="End date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="job-offers-filter-input"
                    />
                    <button type="submit" className="job-offers-filter-btn">Apply Filters</button>
                </form>

                {offers.length === 0 && (
                    <p className="job-offers-status">No job offers found.</p>
                )}

                <div className="job-offers-list">
                    {offers.map((offer) => (
                        <div key={offer.id} className="job-offer-card">
                            <h2 className="job-offer-card-title">{offer.title}</h2>
                            <p className="job-offer-card-employer">{offer.business_name}</p>
                            <p className="job-offer-card-location">{offer.work_location}</p>
                            <p className="job-offer-card-salary">€{offer.salary} / month</p>
                            <p className="job-offer-card-period">{offer.start_date?.slice(0, 10)} — {offer.end_date?.slice(0, 10)}</p>
                            <div className="job-offer-card-actions">
                                <button
                                    className="job-offer-card-btn-view"
                                    onClick={() => navigate(`/browse/${offer.id}`)}
                                >
                                    View Details
                                </button>
                                <button className="job-offer-card-btn-apply" onClick={() => user ? navigate(`/browse/${offer.id}/apply`) : navigate('/login')}>
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

export default JobOffers;