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

        if (offerRows.length === 0 || offerRows[0].status !== 'open') {
            return res.status(404).json({ error: 'Job offer not found or is closed' });
        }

        const [existing] = await pool.query(
            `SELECT id
            FROM application
            WHERE employee_id = ? AND job_offer_id = ?`,
            [employeeId, job_offer_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'You have already applied for this job'});
        }

        const [requiredDocs] = await pool.query(
            'SELECT id FROM required_document WHERE job_offer_id = ?',
            [job_offer_id]
        );

        if (!req.files || req.files.length !== requiredDocs.length) {
            return res.status(400).json({ error: 'You must upload one file per required document' });
        }

        const [result] = await pool.query(
            `INSERT INTO application (employee_id, job_offer_id)
              VALUES (?, ?)`,
              [employeeId, job_offer_id]
        );

        const applicationId = result.insertId;

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const requiredDocId = requiredDocs[i].id;
            const ext = file.originalname.split('.').pop().toLowerCase();

            await pool.query(
                `INSERT INTO application_document (application_id, required_document_id, file, file_type)
                VALUES (?, ?, ?, ?)`,
                [applicationId, requiredDocId, file.path, ext]
            );
        }

        res.status(201).json({ message: 'Application submitted successfully', application_id: applicationId});
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

module.exports = router;