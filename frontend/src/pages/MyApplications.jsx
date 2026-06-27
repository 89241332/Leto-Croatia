import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './css/MyApplications.css';

function MyApplications() {
    const navigate = useNavigate()
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadApplications() {
            try {
                const res = await fetch('/api/applications/my', {
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error);
                    return;
                }
                setApplications(data);
            } catch {
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        }
        loadApplications();
    }, []);
}