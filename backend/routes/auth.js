const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

//POST method /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role, phone } = req.body;

        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({ error: 'Role must be employer or employee' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM user WHERE email = ?',
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassowrd = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO user (first_name, last_name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassowrd, role, phone || null]
        );

        req.session.user = {
            id: result.insertId,
            first_name,
            last_name,
            email,
            role,
        };

    }
})