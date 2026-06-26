const express = require('express');
const pool = require('../db');
const router = express.Router();

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

module.exports = router;