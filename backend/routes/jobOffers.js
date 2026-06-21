const express = require('express');
const pool = require('../db');

const router = express.Router();

// POST /api/job-offers - create a job offer
router.post('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (req.session.user.role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can create job offers.' });
    }

    const [employers] = await pool.query(
        'SELECT id FROM employer WHERE user_id = ?',
        [req.session.user.id]
    );

    if (employers.length === 0) {
        return res.status(404).json({ error: 'Employer profile not found.' });
    }

    const employer_id = employers[0].id;

    const {
        title,
        description,
        working_hours,
        salary,
        start_date,
        end_date,
        work_location,
        positions_available,
        accommodation_type,
        accommodation_location,
        accommodation_additional_info,
        required_documents,
        language_requirements
    } = req.body;

    try {
        const [jobResult] = await pool.query(
            `INSERT INTO job_offer (title, description, working_hours, salary, start_date, end_date, work_location, positions_available, employer_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, working_hours, salary, start_date, end_date, work_location, positions_available, employer_id]
        );

        const job_offer_id = jobResult.insertId;

        await pool.query(
            `INSERT INTO accommodation (accommodation_type, location, additional_info, job_offer_id)
             VALUES (?, ?, ?, ?)`,
            [accommodation_type, accommodation_location, accommodation_additional_info || null, job_offer_id]
        );

        if (required_documents && required_documents.length > 0) {
            for (const doc of required_documents) {
                await pool.query(
                    `INSERT INTO required_document (document_name, description, job_offer_id)
                     VALUES (?, ?, ?)`,
                    [doc.document_name, doc.description || null, job_offer_id]
                );
            }
        }

        if (language_requirements && language_requirements.length > 0) {
            for (const lang of language_requirements) {
                await pool.query(
                    `INSERT INTO language_requirement (language, job_offer_id)
                     VALUES (?, ?)`,
                    [lang.language, job_offer_id]
                );
            }
        }

        return res.status(201).json({ message: 'Job offer created successfully.', job_offer_id });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

module.exports = router;