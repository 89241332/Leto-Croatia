const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

//POST method /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role, phone } = req.body;

        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (role !== 'employer' && role !== 'employee') {
            return res.status(400).json({ error: 'Role must be employer or employee' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM user WHERE email = ?',
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO user (first_name, last_name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, role, phone || null]
        );

        req.session.user = {
            id: result.insertId,
            first_name,
            last_name,
            email,
            role,
        };

        res.status(201).json({
            message: 'Registration successful',
            userId: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//GET method /api/auth/me
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

//POST method /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out' });
    });
});

module.exports = router;