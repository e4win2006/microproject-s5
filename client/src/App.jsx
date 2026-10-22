import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import api from './api';

function Header({ user, onLogout }) {
  return <header className="topbar">
    <Link className="brand" to="/">Campus<span>Connect</span></Link>
    <nav>
      <NavLink to="/">Jobs</NavLink>
      {user?.role === 'student' && <NavLink to="/my-applications">My applications</NavLink>}
      {user?.role === 'recruiter' && <NavLink to="/recruiter">Recruiter</NavLink>}
      {user?.role === 'officer' && <NavLink to="/officer">Placement office</NavLink>}
    </nav>
    <div className="user-area">{user ? <><span>{user.name} · {user.role}</span><button className="secondary small" onClick={onLogout}>Log out</button></> : <Link className="button small" to="/login">Login</Link>}</div>
  </header>;
}

function Login({ onLogin }) {
  const [name, setName] = useState('Demo Student');
  const [email, setEmail] = useState('student@example.com');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();
  function submit(e) {
    e.preventDefault();
    onLogin({ name, email, role, studentId: 1 });
    navigate(role === 'recruiter' ? '/recruiter' : role === 'officer' ? '/officer' : '/');
  }
  return <section className="panel narrow">
    <p className="eyebrow">WELCOME TO CAMPUSCONNECT</p><h1>Sign in to continue</h1>
    <p className="muted">Demo login for college evaluation. Select a role to explore its workflow.</p>
    <form onSubmit={submit} className="stack">
      <label>Full name<input required value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Demo role<select value={role} onChange={e => setRole(e.target.value)}><option value="student">Student</option><option value="recruiter">Recruiter</option><option value="officer">Placement officer</option></select></label>
      <button className="button">Continue to portal</button>
    </form>
  </section>;
}

function Jobs({ user }) {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  async function loadJobs(term = search) {
    setLoading(true);
    try { const { data } = await api.get('/jobs', { params: { search: term } }); setJobs(data); }
    catch { setMessage('Could not connect to the API. Check that the server and MySQL are running.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadJobs(''); }, []);
  async function apply(jobId) {
    if (!user) { setMessage('Please log in as a student before applying.'); return; }
    if (user.role !== 'student') { setMessage('Only student accounts can apply for jobs.'); return; }
    try {
      await api.post('/applications', { student_id: user.studentId, job_id: jobId });
      setMessage('Application submitted successfully!');
    } catch (e) { setMessage(e.response?.data?.error || 'Application could not be submitted.'); }
  }
  return <><section className="hero"><div><p className="eyebrow">YOUR CAREER STARTS HERE</p><h1>Find your next<br/><span>opportunity.</span></h1><p>Discover internships and graduate roles shared by recruiting companies.</p></div><div className="hero-art"><div className="orbit">✦</div><div className="art-card"><span>PLACEMENT READY</span><strong>Skills meet<br/>opportunity.</strong><small>Explore · Apply · Grow</small></div></div></section>
    <section className="content"><div className="section-heading"><div><p className="eyebrow">OPEN POSITIONS</p><h2>Latest opportunities</h2></div><form className="search" onSubmit={e => {e.preventDefault(); loadJobs();}}><input placeholder="Search title, company, location…" value={search} onChange={e => setSearch(e.target.value)} /><button className="button">Search</button></form></div>
      {message && <div className="notice">{message}<button onClick={() => setMessage('')}>×</button></div>}
      {loading ? <p>Loading opportunities…</p> : <div className="job-grid">{jobs.map(job => <article className="job-card" key={job.id}><div className="job-top"><span className="company-mark">{job.company_name.slice(0,1)}</span><span className="tag">{job.job_type}</span></div><h3>{job.title}</h3><p className="company">{job.company_name}</p><p className="muted">{job.location} · Minimum CGPA {Number(job.minimum_cgpa).toFixed(1)}</p><p className="description">{job.description}</p><div className="job-footer"><span className="muted">{job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : 'Applications open'}</span><button className="button" onClick={() => apply(job.id)}>Apply now ↗</button></div></article>)}</div>}
      {!loading && jobs.length === 0 && <div className="empty">No matching jobs. Try another search.</div>}
    </section></>;
}

function MyApplications({ user }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/students/${user?.studentId || 1}/applications`).then(r => setItems(r.data)).catch(() => setError('Could not load applications.')); }, [user]);
  return <section className="content"><p className="eyebrow">STUDENT WORKSPACE</p><h1>My applications</h1><p className="muted">Track the status of each application in one place.</p>{error && <div className="notice">{error}</div>}
    <div className="table-wrap"><table><thead><tr><th>Position</th><th>Company</th><th>Location</th><th>Applied</th><th>Status</th></tr></thead><tbody>{items.map(x => <tr key={x.application_id}><td>{x.title}</td><td>{x.company_name}</td><td>{x.location}</td><td>{new Date(x.applied_at).toLocaleDateString()}</td><td><span className="tag">{x.status}</span></td></tr>)}</tbody></table>{items.length === 0 && <p className="empty">No applications yet. Browse jobs and apply to get started.</p>}</div>
  </section>;
}

function Recruiter() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ company_name: 'TechNova Solutions', title: '', description: '', location: 'Kochi / Hybrid', job_type: 'Internship', minimum_cgpa: '7.0', eligible_department: 'Any', deadline: '' });
  async function load() { try { const { data } = await api.get('/jobs'); setJobs(data); } catch { setNotice('API unavailable. Start the backend and check MySQL settings.'); } }
  useEffect(() => { load(); }, []);
  useEffect(() => { if (selectedJob) { api.get(`/jobs/${selectedJob}/applications`).then(r => setApplicants(r.data)).catch(() => setApplicants([])); } else { setApplicants([]); } }, [selectedJob]);
  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault();
    try { await api.post('/jobs', form); setNotice('Job published successfully.'); setForm({ ...form, title: '', description: '' }); load(); }
    catch (err) { setNotice(err.response?.data?.error || 'Could not publish job.'); }
  }
  async function updateStatus(id, status) {
    try { await api.patch(`/applications/${id}/status`, { status }); setApplicants(old => old.map(a => a.application_id === id ? { ...a, status } : a)); setNotice('Applicant status updated.'); }
    catch { setNotice('Could not update status.'); }
  }
  return <section className="content"><p className="eyebrow">RECRUITER WORKSPACE</p><h1>Manage recruitment</h1><p className="muted">Publish a position and review student applications.</p>{notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    <div className="two-col"><div className="panel"><h2>Post a job</h2><form className="stack" onSubmit={submit}>
      <label>Company name<input name="company_name" value={form.company_name} onChange={update} required /></label><label>Job title<input name="title" value={form.title} onChange={update} required /></label><label>Description<textarea name="description" value={form.description} onChange={update} required rows="3" /></label>
      <div className="form-row"><label>Location<input name="location" value={form.location} onChange={update} /></label><label>Job type<select name="job_type" value={form.job_type} onChange={update}><option>Internship</option><option>Full-time</option><option>Part-time</option></select></label></div>
      <div className="form-row"><label>Minimum CGPA<input type="number" step=".1" min="0" max="10" name="minimum_cgpa" value={form.minimum_cgpa} onChange={update} /></label><label>Eligible department<input name="eligible_department" value={form.eligible_department} onChange={update} /></label></div>
      <label>Application deadline<input type="date" name="deadline" value={form.deadline} onChange={update} /></label><button className="button">Publish job</button>
    </form></div>
    <div className="panel"><h2>Applicants</h2><label>Select a job<select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}><option value="">Choose a job…</option>{jobs.map(j => <option value={j.id} key={j.id}>{j.title}</option>)}</select></label>
      {applicants.map(a => <div className="applicant" key={a.application_id}><div><strong>{a.full_name}</strong><p className="muted">{a.email} · CGPA {a.cgpa}</p></div><select value={a.status} onChange={e => updateStatus(a.application_id, e.target.value)}><option>Applied</option><option>Shortlisted</option><option>Interview</option><option>Selected</option><option>Rejected</option></select></div>)}
      {selectedJob && applicants.length === 0 && <p className="empty">No applicants for this position yet.</p>} {!selectedJob && <p className="empty">Choose a position to view applicants.</p>}
    </div></div>
  </section>;
}

function Officer() {
  const [stats, setStats] = useState({ students: 0, jobs: 0, applications: 0, selected: 0 });
  const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard/summary').then(r => setStats(r.data)).catch(() => setError('Could not connect to the API.')); }, []);
  return <section className="content"><p className="eyebrow">PLACEMENT OFFICE</p><h1>Recruitment overview</h1><p className="muted">A snapshot of student placement activity.</p>{error && <div className="notice">{error}</div>}<div className="stats">{[['Registered students', stats.students], ['Active job posts', stats.jobs], ['Applications', stats.applications], ['Selected', stats.selected]].map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong><small>Live database count</small></div>)}</div><div className="panel"><h2>What this dashboard helps with</h2><ul className="feature-list"><li>Monitor the number of job opportunities.</li><li>Track student applications across companies.</li><li>Review selection progress during placement season.</li></ul></div></section>;
}

export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem('crp-user')); } catch { return null; } });
  function login(value) { setUser(value); sessionStorage.setItem('crp-user', JSON.stringify(value)); }
  function logout() { setUser(null); sessionStorage.removeItem('crp-user'); }
  return <div className="app-shell"><Header user={user} onLogout={logout}/><main><Routes><Route path="/" element={<Jobs user={user}/>}/><Route path="/login" element={<Login onLogin={login}/>}/><Route path="/my-applications" element={<MyApplications user={user}/>}/><Route path="/recruiter" element={<Recruiter/>}/><Route path="/officer" element={<Officer/>}/><Route path="*" element={<section className="content"><h1>Page not found</h1><Link to="/">Return to jobs</Link></section>}/></Routes></main><footer><span>CampusConnect · Campus Recruitment Portal</span><span>Academic microproject · React + MySQL</span></footer></div>;
}
