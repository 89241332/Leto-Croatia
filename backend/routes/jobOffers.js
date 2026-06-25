const express = require('express');
const pool = require('../db');
const upload = require('../upload');

const router = express.Router();

// POST /api/job-offers - create a job offer
router.post('/', upload.single('image'), async (req, res) => {
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
        location,
        additional_info,
        required_documents,
        language_requirements
    } = req.body;

    const parsedDocuments = typeof required_documents === 'string'
        ? JSON.parse(required_documents)
        : required_documents;

    const parsedLanguages = typeof language_requirements === 'string'
        ? JSON.parse(language_requirements)
        : language_requirements;

    if (!title || !description || !working_hours || !salary || !start_date || !end_date || !work_location || !positions_available) {
        return res.status(400).json({ error: 'Please fill in all required job details.' });
    }

    if (!accommodation_type || !location) {
        return res.status(400).json({ error: 'Please fill in accommodation type and location.' });
    }

    if (!parsedDocuments || parsedDocuments.length === 0 || parsedDocuments.some(doc => !doc.document_name)) {
        return res.status(400).json({ error: 'Please add at least one required document with a name.' });
    }

    if (!parsedLanguages || parsedLanguages.length === 0 || parsedLanguages.some(lang => !lang.language)) {
        return res.status(400).json({ error: 'Please add at least one language requirement.' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Please upload an image for the job offer.' });
    }

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
            [accommodation_type, location, additional_info || null, job_offer_id]
        );

        if (parsedDocuments && parsedDocuments.length > 0) {
            for (const doc of parsedDocuments) {
                await pool.query(
                    `INSERT INTO required_document (document_name, description, job_offer_id)
                     VALUES (?, ?, ?)`,
                    [doc.document_name, doc.description || null, job_offer_id]
                );
            }
        }

        if (parsedLanguages && parsedLanguages.length > 0) {
            for (const lang of parsedLanguages) {
                await pool.query(
                    `INSERT INTO language_requirement (language, job_offer_id)
                     VALUES (?, ?)`,
                    [lang.language, job_offer_id]
                );
            }
        }

        await pool.query(
            'INSERT INTO job_offer_image (file, job_offer_id) VALUES (?, ?)',
            ['uploads/' + req.file.filename, job_offer_id]
        );

        return res.status(201).json({ message: 'Job offer created successfully.', job_offer_id });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

// GET /api/job-offers/my - get employer's own job offers
router.get('/my', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (req.session.user.role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can access this.' });
    }

    try {
        const [employers] = await pool.query(
            'SELECT id FROM employer WHERE user_id = ?',
            [req.session.user.id]
        );

        if (employers.length === 0) {
            return res.status(404).json({ error: 'Employer profile not found.' });
        }

        const employer_id = employers[0].id;

        const [jobOffers] = await pool.query(
            `SELECT j.*, 
                    a.accommodation_type, a.location AS accommodation_location, a.additional_info,
                    GROUP_CONCAT(DISTINCT rd.document_name SEPARATOR ', ') AS required_documents,
                    GROUP_CONCAT(DISTINCT lr.language SEPARATOR ', ') AS languages
             FROM job_offer j
             LEFT JOIN accommodation a ON a.job_offer_id = j.id
             LEFT JOIN required_document rd ON rd.job_offer_id = j.id
             LEFT JOIN language_requirement lr ON lr.job_offer_id = j.id
             WHERE j.employer_id = ?
             GROUP BY j.id, a.accommodation_type, a.location, a.additional_info`,
            [employer_id]
        );

        return res.status(200).json(jobOffers);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

// GET /api/job-offers/:id - get a single job offer
router.get('/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (req.session.user.role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can access this.' });
    }

    const job_offer_id = req.params.id;

    try {
        const [employers] = await pool.query(
            'SELECT id FROM employer WHERE user_id = ?',
            [req.session.user.id]
        );

        if (employers.length === 0) {
            return res.status(404).json({ error: 'Employer profile not found.' });
        }

        const employer_id = employers[0].id;

        const [jobOffers] = await pool.query(
            `SELECT j.*,
                    a.accommodation_type, a.location AS accommodation_location, a.additional_info
             FROM job_offer j
             LEFT JOIN accommodation a ON a.job_offer_id = j.id
             WHERE j.id = ? AND j.employer_id = ?`,
            [job_offer_id, employer_id]
        );

        if (jobOffers.length === 0) {
            return res.status(404).json({ error: 'Job offer not found or you do not own it.' });
        }

        const [requiredDocuments] = await pool.query(
            'SELECT id, document_name, description FROM required_document WHERE job_offer_id = ?',
            [job_offer_id]
        );

        const [languageRequirements] = await pool.query(
            'SELECT id, language FROM language_requirement WHERE job_offer_id = ?',
            [job_offer_id]
        );

        const jobOffer = jobOffers[0];
        jobOffer.required_documents = requiredDocuments;
        jobOffer.language_requirements = languageRequirements;

        return res.status(200).json(jobOffer);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

// DELETE /api/job-offers/:id - delete a job offer
router.delete('/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (req.session.user.role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can delete job offers.' });
    }

    const job_offer_id = req.params.id;

    try {
        const [employers] = await pool.query(
            'SELECT id FROM employer WHERE user_id = ?',
            [req.session.user.id]
        );

        if (employers.length === 0) {
            return res.status(404).json({ error: 'Employer profile not found.' });
        }

        const employer_id = employers[0].id;

        const [jobOffers] = await pool.query(
            'SELECT id FROM job_offer WHERE id = ? AND employer_id = ?',
            [job_offer_id, employer_id]
        );

        if (jobOffers.length === 0) {
            return res.status(404).json({ error: 'Job offer not found or you do not own it.' });
        }

        await pool.query('DELETE FROM accommodation WHERE job_offer_id = ?', [job_offer_id]);
        await pool.query('DELETE FROM required_document WHERE job_offer_id = ?', [job_offer_id]);
        await pool.query('DELETE FROM language_requirement WHERE job_offer_id = ?', [job_offer_id]);
        await pool.query('DELETE FROM job_offer_image WHERE job_offer_id = ?', [job_offer_id]);
        await pool.query('DELETE FROM job_offer WHERE id = ?', [job_offer_id]);

        return res.status(200).json({ message: 'Job offer deleted successfully.' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

// PUT /api/job-offers/:id - edit a job offer
router.put('/:id', upload.single('image'), async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    if (req.session.user.role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can edit job offers.' });
    }

    const job_offer_id = req.params.id;

    const {
        title,
        description,
        working_hours,
        salary,
        start_date,
        end_date,
        work_location,
        positions_available,
        status,
        accommodation_type,
        location,
        additional_info,
        required_documents,
        language_requirements
    } = req.body;

    const parsedDocuments = typeof required_documents === 'string'
        ? JSON.parse(required_documents)
        : required_documents;

    const parsedLanguages = typeof language_requirements === 'string'
        ? JSON.parse(language_requirements)
        : language_requirements;

    if (!title || !description || !working_hours || !salary || !start_date || !end_date || !work_location || !positions_available) {
        return res.status(400).json({ error: 'Please fill in all required job details.' });
    }

    if (!accommodation_type || !location) {
        return res.status(400).json({ error: 'Please fill in accommodation type and location.' });
    }

    try {
        const [employers] = await pool.query(
            'SELECT id FROM employer WHERE user_id = ?',
            [req.session.user.id]
        );

        if (employers.length === 0) {
            return res.status(404).json({ error: 'Employer profile not found.' });
        }

        const employer_id = employers[0].id;

        const [jobOffers] = await pool.query(
            'SELECT id FROM job_offer WHERE id = ? AND employer_id = ?',
            [job_offer_id, employer_id]
        );

        if (jobOffers.length === 0) {
            return res.status(404).json({ error: 'Job offer not found or you do not own it.' });
        }

        await pool.query(
            `UPDATE job_offer SET title = ?, description = ?, working_hours = ?, salary = ?,
             start_date = ?, end_date = ?, work_location = ?, positions_available = ?, status = ?
             WHERE id = ?`,
            [title, description, working_hours, salary, start_date, end_date, work_location, positions_available, status, job_offer_id]
        );

        await pool.query(
            `UPDATE accommodation SET accommodation_type = ?, location = ?, additional_info = ?
             WHERE job_offer_id = ?`,
            [accommodation_type, location, additional_info || null, job_offer_id]
        );

        await pool.query('DELETE FROM required_document WHERE job_offer_id = ?', [job_offer_id]);
        await pool.query('DELETE FROM language_requirement WHERE job_offer_id = ?', [job_offer_id]);

        if (parsedDocuments && parsedDocuments.length > 0) {
            for (const doc of parsedDocuments) {
                await pool.query(
                    `INSERT INTO required_document (document_name, description, job_offer_id)
                    VALUES (?, ?, ?)`,
                    [doc.document_name, doc.description || null, job_offer_id]
                );
            }
        }

        if (parsedLanguages && parsedLanguages.length > 0) {
            for (const lang of parsedLanguages) {
                await pool.query(
                    `INSERT INTO language_requirement (language, job_offer_id)
                    VALUES (?, ?)`,
                    [lang.language, job_offer_id]
                );
            }
        }

        if (req.file) {
            await pool.query(
                'DELETE FROM job_offer_image WHERE job_offer_id = ?',
                [job_offer_id]
            );
            await pool.query(
                'INSERT INTO job_offer_image (file, job_offer_id) VALUES (?, ?)',
                ['uploads/' + req.file.filename, job_offer_id]
            );
        }

        return res.status(200).json({ message: 'Job offer updated successfully.' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
});

module.exports = router;