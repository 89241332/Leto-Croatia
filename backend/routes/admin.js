const express = require('express');
const pool = require('../db');

const router = express.Router();

//GET /api/admin/users - get all users
router.get('/users', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied.' });
    }

    try {
        const [users] = await pool.query(
            'SELECT id, first_name, last_name, email, role, registered_at FROM user'
        );
        return res.status(200).json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

//DELETE /api/admin/users/:id - delete a user
router.delete('/users/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (res.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied.' });
    }

    const { id } = req.params;
    
    try {
        await pool.query(
            'DELETE FROM user WHERE id = ?',
            [id]
        );
        return res.status(200).json({ message: 'User deleted.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

//GET /api/admin/job-offer - get all job offers
router.get('/job-offers', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied.' });
    }

    try {
        const [jobOffers] = await pool.query(
            `SELECT jo.id, jo.title, jo.status, jo.created_at, u.first_name, u.last_name
            FROM job_offer jo
            JOIN employer e ON jo.employer_id = e.id
            JOIN user u ON e.user_id = u.id`
        );
        return res.status(200).json(jobOffers);
    } catch (err) {
        console.error(err);
        return req.status(500).json({ error: 'Server error.' });
    }
});

//DELETE /api/admin/job-offers/:id - delete a job offer
router.delete('/job-offers/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied.' });
    }

    const { id } = req.params;

    try {
        await pool.query(
            'DELETE FROM job_offer WHERE id = ?',
            [id]
        );
        return res.status(200).json({ message: 'Job offer deleted.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error.'});
    }
});

module.exports = router;