import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './css/EmployerProfileView.css';

function EmployerProfileView() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch('/api/profile', {
                    credentials: 'include'
                })
                const data = await res.json();

                if (!res.ok) {
                    navigate('/login');
                    return;
                }

                if (data.role !== 'employer'){
                    navigate('/browse');
                    return;
                }

                setProfile(data);
            } catch (err) {
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    async function handleLogout() {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        navigate('/login')
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

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
                        <div className="profile-view-row">
                            <span className="profile-view-label">First Name</span>
                            <span>{profile.first_name}</span>
                        </div>
                        <div className="profile-view-row">
                            <span className="profile-view-label">Last Name</span>
                            <span>{profile.last_name}</span>
                        </div>
                        <div className="profile-view-row">
                            <span className="profile-view-label">Email</span>
                            <span>{profile.email}</span>
                        </div>
                        <div className="profile-view-row">
                            <span className="profile-view-label">Phone</span>
                            <span>{profile.phone || '-'}</span>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3 className="profile-section-title">Business Information</h3>
                        <div className="profile-view-row">
                            <span className="profile-view-label">Business Name</span>
                            <span>{profile.business_name}</span>
                        </div>
                        <div className="profile-view-row">
                            <span className="profile-view-label">Work Location</span>
                            <span>{profile.work_location}</span>
                        </div>
                        <div className="profile-view-row">
                            <span className="profile-view-label">Description</span>
                            <span>{profile.description || '-'}</span>
                        </div>
                    </div>

                    <div className="profile-view-actions">
                        <button className="auth-btn" onClick={() => navigate('/employer-profile')}>Edit Profile</button>
                        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                        <button className="auth-btn" onClick={() => navigate('/job-offers')}>Back</button>
                    </div>
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

export default EmployerProfileView;