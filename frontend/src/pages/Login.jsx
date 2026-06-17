import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                setLoading(false);
                return;
            }

            await refreshUser();
            const role = data.user.role;
            navigate(role === 'employer' ? '/employer' : '/employee');
        } catch (err) {
            setError('Something went wrong. Please try again!');
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
                        <h2 className="auth-title">Welcome Back</h2>
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
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="auth-forgot">
                                <Link to="/reset-password" className="auth-link">Forgot password?</Link>
                            </div>
                            {error && <p className="auth-error">{error}</p>}
                            <button
                                className="auth-btn"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>
                        </div>
                        <p className="auth-footer">
                            Don't have an account? <Link to="/register" className="auth-link">Register</Link>
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

export default Login;