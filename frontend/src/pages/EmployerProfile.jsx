import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function EmployerProfile() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [workLocation, setWorkLocation] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await fetch('/api/profile', {
                    credentials: 'include',
                });
                const data = await response.json();

                if (!response.ok) {
                    navigate('/login');
                    return;
                }

                if (data.role !== 'employer') {
                    navigate('/employee-profile');
                    return;
                }

                setFirstName(data.first_name);
                setLastName(data.last_name);
                setPhone(data.phone || '');
                setBusinessName(data.business_name);
                setWorkLocation(data.work_location);
                setDescription(data.description || '');
            } catch (err) {
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    business_name: businessName,
                    work_location: workLocation,
                    description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                setSaving(false);
                return;
            }

            setSuccess('Profile updated successfully.');
            setSaving(false);
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setSaving(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="page-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
            </nav>

            <div className="profile-page">
                <div className="profile-card">
                    <h2 className="profile-title">My Profile</h2>

                    <div className="profile-section">
                        <h3 className="profile-section-title">Personal Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                className="auth-input"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3 className="profile-section-title">Business Information</h3>
                        <div className="form-group">
                            <label>Business Name</label>
                            <input
                                className="auth-input"
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Work Location</label>
                            <input
                                className="auth-input"
                                type="text"
                                value={workLocation}
                                onChange={(e) => setWorkLocation(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                className="auth-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="auth-error">{error}</p>}
                    {success && <p className="success-text">{success}</p>}

                    <button
                        className="auth-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    { ' ' }
                    <button className="auth-btn" onClick={() => navigate('/employer-profile-view')}>Back</button>
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
    );
}

export default EmployerProfile;