const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/browse - browse job offers
router.get('/', async (req, res) => {
    const { location, language, salary_min, salary_max, start_date, end_date } = req.query;

    try {
        let query = `
            SELECT
                jo.id,
                jo.title,
                jo.description,
                jo.working_hours,
                jo.salary,
                jo.start_date,
                jo.end_date,
                jo.work_location,
                jo.positions_available,
                jo.created_at,
                e.business_name,
                a.accommodation_type,
                a.location AS accommodation_location
            FROM job_offer jo
            JOIN employer e ON jo.employer_id = e.id
            LEFT JOIN accommodation a ON a.job_offer_id = jo.id
            WHERE jo.status = 'open'
        `;

        const params = [];

        if (location) {
            query += ` AND jo.work_location LIKE ?`;
            params.push(`%${location}%`);
        }

        if (salary_min) {
            query += ` AND jo.salary >= ?`;
            params.push(salary_min);
        }

        if (salary_max) {
            query += ` AND jo.salary <= ?`;
            params.push(salary_max);
        }

        if (start_date) {
            query += ` AND jo.start_date >= ?`;
            params.push(start_date);
        }

        if (end_date) {
            query += ` AND jo.end_date <= ?`;
            params.push(end_date);
        }

        if (language) {
            query += ` AND jo.id IN (
                SELECT job_offer_id FROM language_requirement WHERE language LIKE ?
            )`;
            params.push(`%${language}%`);
        }

        query += ` ORDER BY jo.created_at DESC`;

        const [rows] = await pool.query(query, params);
        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/browse/search - search job offers
router.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim();

    if (!q) {
        return res.json([]);
    }

    try {
        const [rows] = await pool.query(
            `SELECT
                jo.id,
                jo.title,
                jo.description,
                jo.working_hours,
                jo.salary,
                jo.start_date,
                jo.end_date,
                jo.work_location,
                jo.positions_available,
                jo.created_at,
                e.business_name,
                a.accommodation_type,
                a.location AS accommodation_location
            FROM job_offer jo
            JOIN employer e ON jo.employer_id = e.id
            LEFT JOIN accommodation a ON a.job_offer_id = jo.id
            WHERE jo.status = 'open'
            AND jo.title LIKE ?
            ORDER BY jo.created_at DESC`,
            [`%${q}%`]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/browse/:id - get job offer by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [jobOffers] = await pool.query(
            `SELECT j.*,
                    e.business_name,
                    a.accommodation_type, a.location AS accommodation_location, a.additional_info
             FROM job_offer j
             JOIN employer e ON j.employer_id = e.id
             LEFT JOIN accommodation a ON a.job_offer_id = j.id
             WHERE j.id = ? AND j.status = 'open'`,
            [id]
        );

        if (jobOffers.length === 0) {
            return res.status(404).json({ error: 'Job offer not found.' });
        }

        const [requiredDocuments] = await pool.query(
            'SELECT id, document_name, description FROM required_document WHERE job_offer_id = ?',
            [id]
        );

        const [languageRequirements] = await pool.query(
            'SELECT id, language FROM language_requirement WHERE job_offer_id = ?',
            [id]
        );

        const [images] = await pool.query(
            'SELECT id, file FROM job_offer_image WHERE job_offer_id = ?',
            [id]
        );

        const jobOffer = jobOffers[0];
        jobOffer.required_documents = requiredDocuments;
        jobOffer.language_requirements = languageRequirements;
        jobOffer.images = images;

        return res.status(200).json(jobOffer);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

module.exports = router;