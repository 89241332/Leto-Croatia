const express = require('express');
const pool = require('../db');
const upload = require('../upload');
const router = express.Router();

//POST method /api/applications - submit application
router.post('/', upload.array('documents'), async (req, res) => {
    if(!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const userId = req.session.user.id;
    const { job_offer_id } = req.body;

    if (!job_offer_id) {
        return res.status(400).json({ error: 'job_offer_id not found' });
    }

    try {
        const [employeeRows] = await pool.query(
            'SELECT id FROM employee WHERE user_id = ?',
            [userId]
        );

        if (employeeRows.length === 0) {
            return res.status(403).json({ error: 'Only employees can apply'});
        }

        const employeeId = employeeRows[0].id;

        const [offerRows] = await pool.query(
            'SELECT id, status FROM job_offer WHERE id = ?',
            [job_offer_id]
        );

        
    }
})