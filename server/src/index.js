import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const search = `%${String(req.query.search || '').trim()}%`;
    const [rows] = await pool.execute(
      `SELECT j.id, j.company_name, j.title, j.description, j.location, j.job_type,
              j.minimum_cgpa, j.eligible_department, j.deadline, j.created_at,
              COUNT(a.id) AS applicant_count
       FROM jobs j LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.title LIKE ? OR j.company_name LIKE ? OR j.location LIKE ?
       GROUP BY j.id ORDER BY j.created_at DESC`,
      [search, search, search]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load jobs', detail: err.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  const { company_name, title, description, location, job_type, minimum_cgpa, eligible_department, deadline } = req.body;
  if (!company_name || !title || !description) {
    return res.status(400).json({ error: 'Company, title, and description are required.' });
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO jobs (company_name, title, description, location, job_type, minimum_cgpa, eligible_department, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, title, description, location || 'Kerala / Hybrid', job_type || 'Full-time',
       Number(minimum_cgpa || 0), eligible_department || 'Any', deadline || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Job posted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not create job', detail: err.message });
  }
});

app.get('/api/jobs/:id/applications', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.id AS application_id, a.status, a.applied_at,
              s.id AS student_id, s.full_name, s.email, s.department, s.cgpa
       FROM applications a JOIN students s ON s.id = a.student_id
       WHERE a.job_id = ? ORDER BY a.applied_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load applicants', detail: err.message });
  }
});

app.get('/api/students/:studentId/applications', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.id AS application_id, a.status, a.applied_at,
              j.title, j.company_name, j.location, j.job_type
       FROM applications a JOIN jobs j ON j.id = a.job_id
       WHERE a.student_id = ? ORDER BY a.applied_at DESC`,
      [req.params.studentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load applications', detail: err.message });
  }
});

app.post('/api/applications', async (req, res) => {
  const { student_id, job_id } = req.body;
  if (!student_id || !job_id) return res.status(400).json({ error: 'student_id and job_id are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO applications (student_id, job_id) VALUES (?, ?)',
      [Number(student_id), Number(job_id)]
    );
    res.status(201).json({ id: result.insertId, message: 'Application submitted.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'You have already applied for this job.' });
    if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Student or job was not found. Run schema.sql seed data.' });
    res.status(500).json({ error: 'Could not submit application', detail: err.message });
  }
});

app.patch('/api/applications/:id/status', async (req, res) => {
  const allowed = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid application status.' });
  try {
    const [result] = await pool.execute('UPDATE applications SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Application not found.' });
    res.json({ message: 'Application status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update status', detail: err.message });
  }
});

app.get('/api/dashboard/summary', async (_req, res) => {
  try {
    const [[students]] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [[jobs]] = await pool.query('SELECT COUNT(*) AS total FROM jobs');
    const [[applications]] = await pool.query('SELECT COUNT(*) AS total FROM applications');
    const [[selected]] = await pool.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Selected'");
    res.json({ students: students.total, jobs: jobs.total, applications: applications.total, selected: selected.total });
  } catch (err) {
    res.status(500).json({ error: 'Could not load dashboard', detail: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Campus Recruitment API running at http://localhost:${port}`));
