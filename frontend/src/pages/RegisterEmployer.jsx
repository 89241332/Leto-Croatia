import { useState } from 'react'
import { useNavigate, Link} from 'react-router-dom'

export default function RegisterEmployer() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [workLocation, setWorkLocation] = useState('')
    const [description, setDescription] = useState('')
    const [proofDocument, setProofDocument] = useState(null)
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
            formData.append('email', email)
            formData.append('phone', phone)
            formData.append('password', password)
            formData.append('role', 'employer')
            formData.append('business_name', businessName)
            formData.append('work_location', workLocation)
            formData.append('description', description)
            if (proofDocument) formData.append('proof_document', proofDocument)

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

            navigate('/')
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
                    <h1>Create Your Employer Profile</h1>

                    {error && <div className='error-box'>{error}</div>}

                    <div className='register-form-section'>
                        <h2>Account Details</h2>

                        <div className='form-row'>
                            <div className='form-group'>
                                <label>First Name</label>
                                <input type='text' placeholder='Enter first name' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className='form-group'>
                                <label>Last Name</label>
                                <input type='text' placeholder='Enter last name' value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row-full'>
                            <div className='form-group'>
                                <label>Email</label>
                                <input type='email' placeholder='email@company.com' value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row-full'>
                            <div className='form-group'>
                                <label>Phone</label>
                                <input type='text' placeholder='+385 00 000 0000' value={phone} onChange={(e) => setPhone(e.target.value)} />
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

                    </div>

                    <div className='register-form-section'>
                        <h2>Business Information</h2>

                        <div className='form-row-full'>
                            <div className='form-group'>
                                <label>Business Name</label>
                                <input type='text' placeholder='Legal business name' value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row-full'>
                            <div className='form-group'>
                                <label>Work Location</label>
                                <input type='text' placeholder='City, Region (e.g. Split, Dalmatia)' value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row-full'>
                            <div className='form-group'>
                                <label>Business Description</label>
                                <textarea placeholder='Tell potential employees about your company...' value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </div>

                        <div className='form-row-full'>
                            <div className='form-group'>
                                <label>Proof Document</label>
                                <input type='file' onChange={(e) => setProofDocument(e.target.files[0])} />
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