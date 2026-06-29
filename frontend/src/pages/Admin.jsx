import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './css/Admin.css';

function Admin() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [jobOffers, setJobOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch('/api/profile', {
                    credentials: 'include'
                })
                const data = await response.json();

                if (!response.ok) {
                    navigate('/login');
                    return;
                }

                if (data.role !== 'admin') {
                    navigate('/browse');
                    return;
                }

                const [usersRes, jobOffersRes] = await Promise.all([
                    fetch('/api/admin/users', { credentials: 'include' }),
                    fetch('/api/admin/job-offers', { credentials: 'include' })
                ]);

                const usersData = await usersRes.json();
                const jobOffersData = await jobOffersRes.json();

                setUsers(usersData);
                setJobOffers(jobOffersData);
            } catch (err) {
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    async function handleDeleteUser(id) {
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                const usersRes = await fetch('/api/admin/users', {credentials: 'include' });
                const usersData = await usersRes.json();
                setUsers(usersData);
            }
        } catch (err) {
            setError('Failed to delete user.');
        }
    }

    async function handleDeleteJobOffer(id) {
        try {
            const response = await fetch(`/api/admin/job-offers/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                const jobOffersRes = await fetch('/api/admin/job-offers', {
                    credentials: 'include'
                });
                const jobOffersData = await jobOffersRes.json();
                setJobOffers(jobOffersData);
            }
        } catch (err) {
            setError('Failed to delete job offer.');
        }
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        navigate('/login');
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div className="page-wrapper">

            <nav className="navbar">
                <span className="navbar-brand">LetoCroatia</span>
            </nav>

            <div className="admin-page">
                <h2 className="admin-title">Admin Panel</h2>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                <div className="admin-section">
                    <h3 className="admin-section-title">Users</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Registered At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.first_name}</td>
                                    <td>{user.last_name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.registered_at ? user.registered_at.split('T')[0] : '-'}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-section">
                    <h3 className="admin-section-title">Job Offers</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Employer</th>
                                <th>Created At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobOffers.map(offer => (
                                <tr key={offer.id}>
                                    <td>{offer.id}</td>
                                    <td>{offer.title}</td>
                                    <td>{offer.status}</td>
                                    <td>{offer.first_name} {offer.last_name}</td>
                                    <td>{offer.created_at ? offer.created_at.split('T')[0] : '-'}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => handleDeleteJobOffer(offer.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

export default Admin