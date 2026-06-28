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

//GET /api/applications/my - get applications for logged in employee
router.get('/my', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const userId = req.session.user.id;

    try {
        const [employeeRows] = await pool.query(
            'SELECT id FROM employee WHERE user_id = ?',
            [userId]
        );

        if (employeeRows.length === 0) {
            return res.status(403).json({ error: 'Only employees can access this' });
        }

        const employeeId = employeeRows[0].id;

        const [rows] = await pool.query(
            `SELECT a.id,
                    a.status,
                    a.submitted_at,
                    a.withdrawn_at,
                    jo.title,
                    jo.work_location,
                    jo.start_date,
                    jo.end_date,
                    e.business_name
            FROM application a
            JOIN job_offer jo ON a.job_offer_id = jo.id
            JOIN employer e ON jo.employer_id = e.id
            WHERE a.employee_id = ?
            ORDER BY a.submitted_at DESC`,
            [employeeId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//DELETE method /api/applications/:id - delete application
router.delete('/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const userId = req.session.user.id;
    const applicationId = req.params.id;

    try {
        const [employeeRows] = await pool.query(
            'SELECT id FROM employee WHERE user_id = ?',
            [userId]
        );

        if (employeeRows.length === 0) {
            return res.status(403).json({ error: 'Only employees can delete applications' });
        }

        const employeeId = employeeRows[0].id;

        const [appRows] = await pool.query(
            'SELECT id, status FROM application WHERE id = ? AND employee_id = ?',
            [applicationId, employeeId]
        );

        if (appRows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (appRows[0].status === 'accepted') {
            return res.status(400).json({ error: 'Cannot withdraw an accepted application'});
        }

        await pool.query(
            `UPDATE application SET status = 'withdrawn', withdrawn_at = NOW()
            WHERE id = ?`,
            [applicationId]
        );

        res.json({ message: 'Application withdrawn successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//GET /api/applications/job-offer/:jobOfferId - get all applications for a single job offer
router.get('/job-offer/:jobOfferId', async (req, res) => {
    if (!req.session.user){
        return res.status(401).json({ error: 'Not logged in' });
    }

    const userId = req.session.user.id;
    const { jobOfferId } = req.params;

    try {
        const [employerRows] = await pool.query(
            'SELECT id FROM employer WHERE user_id = ?',
            [userId]
        );

        if (employerRows.length === 0) {
            return res.status(403).json({ error: 'Only employers can view applications for a job offer' });
        }

        const employerId = employerRows[0].id;

        const [offerRows] = await pool.query(
            'SELECT id FROM job_offer WHERE id = ? AND employer_id = ?',
            [jobOfferId, employerId]
        );

        if (offerRows.length === 0) {
            return res.status(404).json({ error: 'Job offer not found' });
        }

        const [rows] = await pool.query(
            `SELECT
                a.id,
                a.status,
                a.submitted_at,
                a.withdrawn_at,
                u.first_name,
                u.last_name,
                u.email,
                emp.nationality
             FROM application a
             JOIN employee emp ON a.employee_id = emp.id
             JOIN user u ON emp.user_id = u.id
             WHERE a.job_offer_id = ?
             ORDER BY a.submitted_at ASC`,
            [jobOfferId]
        );

        for (const application of rows) {
            const [docs] = await pool.query(
                `SELECT ad.file, ad.file_type, rd.document_name
                FROM application_document ad
                JOIN required_document rd ON ad.required_document_id = rd.id
                WHERE ad.application_id = ?`,
                [application.id]
            );
            application.documents = docs
        }

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//POST /api/applications/:id/status - accept or reject an application
router.post('/:id/status', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const userId = req.session.user.id;
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }

    try {
        const [employerRows] = await pool.query(
            'SELECT id FROM employer WHERE user_id = ?',
            [userId]
        );

        if (employerRows.length === 0) {
            return res.status(403).json({ error: 'Only employers can update application status' });
        }

        const employerId = employerRows[0].id;
        const [appRows] = await pool.query(
            `SELECT a.id, a.status
            FROM application a
            JOIN job_offer jo ON a.job_offer_id = jo.id
            WHERE a.id = ? AND jo.employer_id = ?`,
            [applicationId, employerId]
        );

        if (appRows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (appRows[0].status === 'withdrawn') {
            return res.status(400).json({ error: 'Cannot update a withdrawn application'});
        }

        await pool.query(
            'UPDATE application SET status = ? WHERE id = ?',
            [status, applicationId]
        );

        res.json({ message: `Application ${status} successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;