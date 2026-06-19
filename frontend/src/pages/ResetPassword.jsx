import { useState } from "react";
import { Link } from 'react-router-dom';

function ResetPassword() {
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!email || !currentPassword || !newPassword) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                setLoading(false);
                return;
            }

            setSuccess('Password updated successfully.');
            setEmail('');
            setCurrentPassword('');
            setNewPassword('');
            setLoading(false);
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
            </nav>

            <div className="auth-page">
                <div className="auth-card">
                    <h2 className="auth-title">Reset Password</h2>
                    <div className="auth-form">
                        <input
                            className="auth-input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        {error && <p className="auth-error">{error}</p>}
                        {success && <p className="success-text">{success}</p>}
                        <button
                            className="auth-btn"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Reset Password'}
                        </button>
                    </div>
                    <p className="auth-footer">
                        <Link to="/login">Back to login</Link>
                    </p>
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

export default ResetPassword;