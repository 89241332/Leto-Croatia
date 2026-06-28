import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './css/EmployeeProfileView.css';

function EmployeeProfileView() {
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

                if (data.role !== 'employee') {
                    navigate('/browse');
                    return;
                }

                setProfile(data);
            } catch (err) {
                setError('Failed to load profile.')
            } finally {
                setLoading(false)
            }
        }
        loadProfile();
    }, []);

    async function handleLogout() {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        navigate('/login');
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        
    )
}

export default EmployeeProfileView;