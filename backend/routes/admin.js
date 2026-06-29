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