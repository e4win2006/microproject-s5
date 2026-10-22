# User Stories and Solutions

## US-01 — Browse job openings
**As a student**, I want to browse available jobs so I can discover opportunities.
- Acceptance: job cards show company, title, location, job type, eligibility CGPA, and deadline.
- Solution: React `Jobs` component calls `GET /api/jobs`; Express retrieves rows from MySQL.

## US-02 — Search for relevant roles
**As a student**, I want to search by job title, company, or location.
- Acceptance: submitting a search shows matching jobs and an empty-state message if none match.
- Solution: controlled search input uses `useState`; request sends `?search=`; parameterized SQL uses `LIKE`.

## US-03 — Apply for a job
**As a student**, I want to submit an application to a job.
- Acceptance: valid application is saved; duplicate applications are rejected with a helpful message.
- Solution: `POST /api/applications`; MySQL `UNIQUE(student_id, job_id)` prevents duplicates.

## US-04 — Track application status
**As a student**, I want to see all my applications and their current status.
- Acceptance: list displays position, company, applied date, and status.
- Solution: `GET /api/students/:studentId/applications` uses a JOIN between applications and jobs.

## US-05 — Publish a vacancy
**As a recruiter**, I want to create a job post with eligibility details.
- Acceptance: required fields are validated and the new job appears in the job list.
- Solution: React form controlled with `useState`; Express validates fields and inserts into `jobs`.

## US-06 — Review applicants
**As a recruiter**, I want to view students who applied for a selected job.
- Acceptance: applicant name, email, department, CGPA, and status are displayed.
- Solution: `GET /api/jobs/:id/applications` joins applications with students.

## US-07 — Update candidate progress
**As a recruiter**, I want to change an application status to Shortlisted, Interview, Selected, or Rejected.
- Acceptance: only supported statuses are accepted and the updated status is reflected.
- Solution: `PATCH /api/applications/:id/status`; backend allow-list validates the status.

## US-08 — Monitor placement activity
**As a placement officer**, I want a dashboard summary of students, jobs, applications, and selections.
- Acceptance: four counts are loaded from the database.
- Solution: `GET /api/dashboard/summary` runs SQL `COUNT(*)` queries; `useEffect` loads the summary.

## US-09 — Prevent orphaned and duplicate data
**As the system administrator**, I want relational integrity.
- Acceptance: applications must reference an existing student and job; one student cannot apply twice to the same job.
- Solution: foreign keys with cascade delete and a unique composite key.

## US-10 — Navigate by role
**As a portal user**, I want simple navigation to the features relevant to my role.
- Acceptance: React Router provides separate jobs, student applications, recruiter, and placement-office routes.
- Solution: `BrowserRouter`, `Routes`, `Route`, `NavLink`, and role-based navigation display.

## Test cases
| ID | Action | Expected result |
|---|---|---|
| TC-01 | Open Jobs page with API running | Seed jobs appear |
| TC-02 | Search `React` | React Developer Intern appears |
| TC-03 | Apply as student to job 1 | Application is saved |
| TC-04 | Apply to job 1 a second time | Duplicate application message |
| TC-05 | Open My applications | Saved application and status appear |
| TC-06 | Post a job as recruiter | New job appears in list |
| TC-07 | Select a job with applicants | Applicant list appears |
| TC-08 | Change status to Interview | Status is saved and updated |
| TC-09 | Open placement dashboard | Counts are shown |
| TC-10 | Stop backend and refresh | Friendly connection error appears |
