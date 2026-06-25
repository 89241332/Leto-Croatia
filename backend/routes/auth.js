const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const upload = require('../upload');

const router = express.Router();

//POST method /api/auth/register
router.post('/register', upload.fields([
    {name: 'identity_proof', maxCount: 1},
    {name: 'proof_document', maxCount: 1}
]), async (req, res) => {
    try {
        const { first_name, 
                last_name, 
                email, 
                password, 
                role, 
                phone, 
                nationality, 
                date_of_birth, 
                business_name, 
                work_location, 
                description 
            } = req.body;

        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (role !== 'employer' && role !== 'employee') {
            return res.status(400).json({ error: 'Role must be employer or employee' });
        }

        if (role === 'employee' && (!nationality || !date_of_birth)) {
            return res.status(400).json({ error: 'Nationality and date of birth are required for employees' });
        }

        if (role === 'employer' && (!business_name || !work_location)) {
            return res.status(400).json({ error: 'Business name and work location are required for employers' });
        }

        if (role === 'employee' && !req.files?.identity_proof?.[0]) {
            return res.status(400).json({ error: 'Identity proof document is required for employees.' });
        }

        if (role === 'employer' && !req.files?.proof_document?.[0]) {
            return res.status(400).json({ error: 'Proof document is required for employers.' });
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

        const userId = result.insertId;

        if (role === 'employee') {
            await pool.query(
                'INSERT INTO employee (nationality, date_of_birth, identity_proof, user_id) VALUES (?, ?, ?, ?)',
                [nationality, 
                 date_of_birth,
                 'uploads/' + req.files.identity_proof[0].filename,
                 userId
                ]
            );
        }

        if (role === 'employer') {
            await pool.query(
                'INSERT INTO employer (business_name, work_location, description, proof_document, user_id) VALUES (?, ?, ?, ?, ?)',
                [business_name,
                 work_location,
                 description || null,
                 'uploads/' + req.files.proof_document[0].filename,
                 userId]
            );
        }

        req.session.user = {
            id: userId,
            first_name,
            last_name,
            email,
            role,
        };

        res.status(201).json({
            message: 'Registration successful',
            userId,
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

//POST method /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const [users] = await pool.query(
            'SELECT * FROM user WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        return res.status(200).json({
            message: 'Login successful.',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

//POST method /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { email, current_password, new_password } = req.body;

    if (!email || !current_password || !new_password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const [users] = await pool.query(
            'SELECT * FROM user WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'No account found with that email.' });
        }

        const user = users[0];
        const match = await bcrypt.compare(current_password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await pool.query(
            'UPDATE user SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
        );

        return res.status(200).json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;