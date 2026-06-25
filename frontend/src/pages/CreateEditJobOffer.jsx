import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './css/CreateEditJobOffer.css';

function CreateEditJobOffer() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [workingHours, setWorkingHours] = useState('');
    const [salary, setSalary] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [workLocation, setWorkLocation] = useState('');
    const [positionsAvailable, setPositionsAvailable] = useState('');
    const [status, setStatus] = useState('open');
    const [accommodationType, setAccommodationType] = useState('');
    const [location, setLocation] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [requiredDocuments, setRequiredDocuments] = useState([{ document_name: '', description: '' }]);
    const [languageRequirements, setLanguageRequirements] = useState([{ language: '' }]);
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isEditing) return;
        const load = async () => {
            const res = await fetch('/api/job-offers/my', { credentials: 'include' });
            const data = await res.json();
            const offer = data.find(o => o.id === parseInt(id));
            if (!offer) return setError('Job offer not found.');
            setTitle(offer.title);
            setDescription(offer.description);
            setWorkingHours(offer.working_hours);
            setSalary(offer.salary);
            setStartDate(offer.start_date.split('T')[0]);
            setEndDate(offer.end_date.split('T')[0]);
            setWorkLocation(offer.work_location);
            setPositionsAvailable(offer.positions_available);
            setStatus(offer.status);
            setAccommodationType(offer.accommodation_type || '');
            setLocation(offer.accommodation_location || '');
            setAdditionalInfo(offer.additional_info || '');
        };
        load();
    }, [id]);

    const handleSubmit = async () => {
        setError('');

        if (!title || !description || !workingHours || !salary || !startDate || !endDate || !workLocation || !positionsAvailable) {
            return setError('Please fill in all required job details.');
        }

        if (!accommodationType || !location) {
            return setError('Please fill in accommodation type and location.');
        }

        if (requiredDocuments.length === 0 || requiredDocuments.some(doc => !doc.document_name)) {
            return setError('Please add at least one required document with a name.');
        }

        if (languageRequirements.length === 0 || languageRequirements.some(lang => !lang.language)) {
            return setError('Please add at least one language requirement.');
        }

        setSaving(true);
        
        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('description', description)
            formData.append('working_hours', workingHours)
            formData.append('salary', salary)
            formData.append('start_date', startDate)
            formData.append('end_date', endDate)
            formData.append('work_location', workLocation)
            formData.append('positions_available', positionsAvailable)
            formData.append('status', status)
            formData.append('accommodation_type', accommodationType)
            formData.append('location', location)
            formData.append('additional_info', additionalInfo)
            formData.append('required_documents', JSON.stringify(requiredDocuments))
            formData.append('language_requirements', JSON.stringify(languageRequirements))
            if (image) formData.append('image', image)

            const url = isEditing ? `/api/job-offers/${id}` : '/api/job-offers'
            const method = isEditing ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                credentials: 'include',
                body: formData
            });
            
            const data = await res.json();
            if (!res.ok) return setError(data.error || 'Something went wrong.');
            navigate('/job-offers');
        } catch (err) {
            setError('Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="register-form-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
                <div className="navbar-actions">
                    <button className="auth-btn" onClick={() => navigate('/employer-profile')}>Go to My Profile</button>
                </div>
            </nav>

            <div className="register-form-content">
                <div className="register-form-card">
                    <h1>{isEditing ? 'Edit Job Offer' : 'Create Job Offer'}</h1>

                    {error && <div className="error-box">{error}</div>}

                    <div className="register-form-section">
                        <h2>Job Details</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Job Title</label>
                                <input type="text" placeholder="e.g. Waiter" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Work Location</label>
                                <input type="text" placeholder="e.g. Split, Croatia" value={workLocation} onChange={e => setWorkLocation(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-row-full">
                            <div className="form-group">
                                <label>Description</label>
                                <textarea placeholder="Describe the responsibilities..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Working Hours</label>
                                <input type="text" placeholder="e.g. 40 hours per week" value={workingHours} onChange={e => setWorkingHours(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Salary (monthly net)</label>
                                <input type="number" placeholder="e.g. 1200" value={salary} onChange={e => setSalary(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Number of Positions</label>
                                <input type="number" placeholder="e.g. 3" value={positionsAvailable} onChange={e => setPositionsAvailable(e.target.value)} />
                            </div>
                            {isEditing && (
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)}>
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="register-form-section">
                        <h2>Accommodation</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Type</label>
                                <input type="text" placeholder="e.g. Apartment" value={accommodationType} onChange={e => setAccommodationType(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" placeholder="e.g. Split city centre" value={location} onChange={e => setLocation(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-row-full">
                            <div className="form-group">
                                <label>Additional Info</label>
                                <textarea placeholder="e.g. Washing machine, shared bathroom..." value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="register-form-section">
                        <h2>Required Documents</h2>

                        {requiredDocuments.map((doc, index) => (
                            <div className="form-row" key={index}>
                                <div className="form-group">
                                    <label>Document Name</label>
                                    <input type="text" placeholder="e.g. Passport" value={doc.document_name} onChange={e => {
                                        const updated = [...requiredDocuments];
                                        updated[index].document_name = e.target.value;
                                        setRequiredDocuments(updated);
                                    }} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" placeholder="e.g. Valid passport required" value={doc.description} onChange={e => {
                                        const updated = [...requiredDocuments];
                                        updated[index].description = e.target.value;
                                        setRequiredDocuments(updated);
                                    }} />
                                </div>
                                <button className="remove-btn" onClick={() => setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index))}>✕</button>
                            </div>
                        ))}

                        <button className="add-btn" onClick={() => setRequiredDocuments([...requiredDocuments, { document_name: '', description: '' }])}>+ Add Document</button>
                    </div>

                    <div className="register-form-section">
                        <h2>Language Requirements</h2>

                        {languageRequirements.map((lang, index) => (
                            <div className="form-row" key={index}>
                                <div className="form-group">
                                    <label>Language</label>
                                    <input type="text" placeholder="e.g. English" value={lang.language} onChange={e => {
                                        const updated = [...languageRequirements];
                                        updated[index].language = e.target.value;
                                        setLanguageRequirements(updated);
                                    }} />
                                </div>
                                <button className="remove-btn" onClick={() => setLanguageRequirements(languageRequirements.filter((_, i) => i !== index))}>✕</button>
                            </div>
                        ))}

                        <button className="add-btn" onClick={() => setLanguageRequirements([...languageRequirements, { language: '' }])}>+ Add Language</button>
                    </div>

                    <div className="form-row-full">
                        <div className="form-group">
                            <label>Job Offer Image</label>
                            <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                        </div>
                    </div>

                    <div className="register-form-footer">
                        <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Job Offer'}
                        </button>
                        <button className="btn-outline" onClick={() => navigate('/job-offers')}>Cancel</button>
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
    );
}

export default CreateEditJobOffer;