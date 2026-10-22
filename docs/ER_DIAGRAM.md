# Database design

```mermaid
erDiagram
  STUDENTS ||--o{ APPLICATIONS : submits
  JOBS ||--o{ APPLICATIONS : receives
  RECRUITERS o|--o{ JOBS : publishes

  STUDENTS {
    int id PK
    varchar full_name
    varchar email UK
    varchar department
    int graduation_year
    decimal cgpa
  }
  RECRUITERS {
    int id PK
    varchar company_name
    varchar email UK
  }
  JOBS {
    int id PK
    int recruiter_id FK
    varchar company_name
    varchar title
    varchar location
    decimal minimum_cgpa
    date deadline
  }
  APPLICATIONS {
    int id PK
    int student_id FK
    int job_id FK
    varchar status
    timestamp applied_at
  }
```

## Relationships
- One student can submit many applications.
- One job can receive many applications.
- Each application belongs to one student and one job.
- A recruiter can publish many jobs.
- `UNIQUE(student_id, job_id)` prevents duplicate applications.
