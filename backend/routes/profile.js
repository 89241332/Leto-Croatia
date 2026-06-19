const express = require('express');
const pool = require('../db');

const router = express.Router();

//GET method /api/profile - get user's profile
router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    const { id, role } = req.session.user;

    try {
        const [users] = await pool.query(
            'SELECT id, first_name, last_name, email, phone, role, registered_at FROM user WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = users[0];

        if (role === 'employee') {
            const [employees] = await pool.query(
                'SELECT nationality, date_of_birth FROM employee WHERE user_id = ?',
                [id]
            );
            return res.status(200).json({ ...user, ...employees[0] });
        }

        if (role === 'employer') {
            const [employers] = await pool.query(
                'SELECT business_name, work_location, description FROM employer WHERE user_id = ?',
                [id]
            );
            return res.status(200).json({ ...user, ...employers[0] });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

//PUT method /api/profile - update user profile
router.put('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    const { id, role } = req.session.user;
    const { first_name, 
            last_name, 
            phone, 
            nationality, 
            date_of_birth, 
            business_name,
            work_location,
            description
        } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({ error: 'First name and last name are required.' });
        }

        try {
            await pool.query(
                'UPDATE user SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
                [first_name, last_name, phone || null, id]
            );

            if (role === 'employee') {
                if (!nationality || !date_of_birth) {
                    return res.status(400).json({ error: 'Nationality and date of birth are required.' });
                }
                await pool.query(
                    'UPDATE employee SET nationality = ?, date_of_birth = ? WHERE user_id = ?',
                    [nationality, date_of_birth, id]
                );
            }

            if (role === 'employer') {
                if (!business_name || !work_location) {
                    return res.status(400).json({ error: 'Business name and work location are required.' });
                }
                await pool.query(
                    'UPDATE employer SET business_name = ?, work_location = ?, description = ? WHERE user_id = ?',
                    [business_name, work_location, description || null, id]
                );
            }

            return res.status(200).json({ message: 'Profile updated successfully.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error.' });
        }
});

module.exports = router;