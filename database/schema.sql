CREATE DATABASE IF NOT EXISTS campus_recruitment;
USE campus_recruitment;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(80) NOT NULL DEFAULT 'Computer Applications',
  graduation_year INT NOT NULL DEFAULT 2029,
  cgpa DECIMAL(3,2) NOT NULL DEFAULT 7.50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruiters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id INT NULL,
  company_name VARCHAR(150) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100) NOT NULL DEFAULT 'Kerala / Hybrid',
  job_type ENUM('Internship','Full-time','Part-time') NOT NULL DEFAULT 'Full-time',
  minimum_cgpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  eligible_department VARCHAR(100) NOT NULL DEFAULT 'Any',
  deadline DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_recruiter FOREIGN KEY (recruiter_id)
    REFERENCES recruiters(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('Applied','Shortlisted','Interview','Selected','Rejected') NOT NULL DEFAULT 'Applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_job (student_id, job_id),
  CONSTRAINT fk_application_student FOREIGN KEY (student_id)
    REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_application_job FOREIGN KEY (job_id)
    REFERENCES jobs(id) ON DELETE CASCADE
);

INSERT IGNORE INTO students (id, full_name, email, department, graduation_year, cgpa)
VALUES (1, 'Demo Student', 'student@example.com', 'Computer Applications', 2029, 8.10);

INSERT IGNORE INTO recruiters (id, company_name, email)
VALUES (1, 'TechNova Solutions', 'hr@technova.example');

INSERT IGNORE INTO jobs (id, recruiter_id, company_name, title, description, location, job_type, minimum_cgpa, eligible_department, deadline)
VALUES
(1, 1, 'TechNova Solutions', 'React Developer Intern', 'Build UI components, integrate APIs, and work with a mentor.', 'Kochi / Hybrid', 'Internship', 7.00, 'Any', '2026-12-15'),
(2, 1, 'TechNova Solutions', 'Junior SQL Developer', 'Write SQL queries, maintain relational data, and test database features.', 'Kottayam', 'Full-time', 6.50, 'Any', '2026-12-20'),
(3, 1, 'TechNova Solutions', 'Graduate Software Trainee', 'Learn full-stack development and collaborate on internal applications.', 'Remote', 'Full-time', 7.50, 'Computer Applications', '2027-01-10');
