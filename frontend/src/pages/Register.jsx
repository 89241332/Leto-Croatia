import { useState } from "react"
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const [role, setRole] = useState(null)
    const navigate = useNavigate()

    const handleContinue = () => {
        if (!role) return
        if (role === 'employee') navigate('/register/employee')
        if (role === 'employer') navigate('/register/employer')
    }

    return (
         <div className='page-wrapper'>

            <nav className='navbar'>
                <span className='navbar-brand'>LetoCroatia</span>
            </nav>

            <div className='register-hero'>
                <h1>Join LetoCroatia</h1>
                <p>How would you like to use the platform?</p>

                <div className='role-cards'>

                    <div className={`role-card ${role === 'employee' ? 'selected' : ''}`} onClick={() => setRole('employee')}>
                        <div className='role-card-icon'>👤</div>
                        <h3>I'm Looking for Work</h3>
                        <span className='role-badge-employee'>EMPLOYEE</span>
                        <button className={`role-card-btn ${role === 'employee' ? 'btn-primary' : 'btn-outline'}`}>
                            {role === 'employee' ? 'Selected ✓' : 'Select'}
                        </button>
                    </div>

                    <div className={`role-card ${role === 'employer' ? 'selected' : ''}`} onClick={() => setRole('employer')}>
                        <div className='role-card-icon'>🏢</div>
                        <h3>I'm Hiring Staff</h3>
                        <span className='role-badge-employer'>EMPLOYER</span>
                        <button className={`role-card-btn ${role === 'employer' ? 'btn-primary' : 'btn-outline'}`}>
                            {role === 'employer' ? 'Selected ✓' : 'Select'}
                        </button>
                    </div>

                </div>

                <button className='btn-primary register-continue-btn' onClick={handleContinue} disabled={!role}>
                    Continue →
                </button>

                <p className='register-note'>You won't be able to change your role after registration.</p>
                <p className='register-login-link'>Already have an account? <Link to='/login'>Log in here</Link></p>
            </div>

            <footer className='footer'>
                <span className='footer-brand'>LetoCroatia</span>
                <div className='footer-links'>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Cookie Policy</span>
                    <span>Contact Support</span>
                </div>
            </footer>

        </div>
    )
}