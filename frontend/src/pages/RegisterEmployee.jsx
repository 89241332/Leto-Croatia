import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterEmployee() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [nationality, setNationality] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [identityProof, setIdentityProof] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleRegister = async () => {
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('first_name', firstName)
            formData.append('last_name', lastName)
            formData.append('nationality', nationality)
            formData.append('date_of_birth', dateOfBirth)
            formData.append('email', email)
            formData.append('phone', phone)
            formData.append('password', password)
            formData.append('role', 'employee')
            if (identityProof) formData.append('identity_proof', identityProof)

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error)
                setLoading(false)
                return
            }

            navigate('/login')
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className='register-form-wrapper'>

            <nav className='navbar'>
                <span className='navbar-brand'>LetoCroatia</span>
            </nav>

            <div className='register-form-content'>
                <div className='register-form-card'>
                    <h1>Create Your Employee Profile</h1>

                    {error && <div className='error-box'>{error}</div>}

                    <div className='register-form-section'>
                        <h2>Personal Info</h2>

                        <div className='form-row'>
                            <div className='form-group'>
                                <label>First Name</label>
                                <input type='text' placeholder='John' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className='form-group'>
                                <label>Last Name</label>
                                <input type='text' placeholder='Doe' value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row'>
                            <div className='form-group'>
                                <label>Nationality</label>
                                <input type='text' placeholder='e.g. Macedonian' value={nationality} onChange={(e) => setNationality(e.target.value)} />
                            </div>
                            <div className='form-group'>
                                <label>Date of Birth</label>
                                <input type='date' value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row'>
                            <div className='form-group'>
                                <label>Email</label>
                                <input type='email' placeholder='john@example.com' value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className='form-group'>
                                <label>Phone</label>
                                <input type='text' placeholder='+385 ...' value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row'>
                            <div className='form-group'>
                                <label>Password</label>
                                <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className='form-group'>
                                <label>Confirm Password</label>
                                <input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row-full'>
                            <div className='form-group'>
                                <label>Identity Proof Document</label>
                                <input type='file' onChange={(e) => setIdentityProof(e.target.files[0])} />
                            </div>
                        </div>

                    </div>

                    <div className='register-form-footer'>
                        <button className='btn-primary' onClick={handleRegister} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account →'}
                        </button>
                        <p>Already have an account? <Link to='/login'>Log in here</Link></p>
                    </div>

                </div>
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