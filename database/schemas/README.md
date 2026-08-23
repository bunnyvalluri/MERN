# InternHub — Database Schemas & Entity Relationship Reference

## Entity Relationship Overview (ERD)

```mermaid
erDiagram
    USER ||--o{ STUDENT_PROFILE : "has profile"
    USER ||--o{ COMPANY : "owns (recruiter)"
    COMPANY ||--o{ INTERNSHIP : "posts"
    USER ||--o{ INTERNSHIP : "creates (recruiter)"
    USER ||--o{ APPLICATION : "submits (student)"
    INTERNSHIP ||--o{ APPLICATION : "receives"
    COMPANY ||--o{ APPLICATION : "manages"
    APPLICATION ||--o{ INTERVIEW : "schedules"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ AUDIT_LOG : "triggers"
    USER ||--o{ SAVED_INTERNSHIP : "bookmarks"
    USER ||--o{ DOCUMENT : "uploads"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "STUDENT | RECRUITER | ADMIN | SUPER_ADMIN"
        boolean isActive
        boolean isVerified
        date lastLoginAt
    }

    STUDENT_PROFILE {
        ObjectId _id PK
        ObjectId userId FK
        string headline
        string bio
        string[] skills
        Education[] education
        Experience[] experience
        Project[] projects
        Certification[] certifications
        Resume resume
        Preferences preferences
    }

    COMPANY {
        ObjectId _id PK
        string name
        string slug UK
        string logo
        string description
        string website
        string industry
        string companySize
        boolean verified
        ObjectId ownerId FK
    }

    INTERNSHIP {
        ObjectId _id PK
        ObjectId companyId FK
        string title
        string slug UK
        string description
        string[] skills
        string remote "REMOTE | HYBRID | ONSITE"
        string type "FULL_TIME | PART_TIME"
        Stipend stipend
        number openings
        date applicationDeadline
        string status "DRAFT | PUBLISHED | CLOSED | ARCHIVED"
        ObjectId createdBy FK
    }

    APPLICATION {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId internshipId FK
        ObjectId companyId FK
        Resume resume
        string coverLetter
        string status "APPLIED | UNDER_REVIEW | SHORTLISTED | INTERVIEW | SELECTED | REJECTED | WITHDRAWN"
        TimelineEntry[] timeline
        RecruiterNote[] notes
    }

    INTERVIEW {
        ObjectId _id PK
        ObjectId applicationId FK
        ObjectId internshipId FK
        ObjectId studentId FK
        ObjectId companyId FK
        ObjectId recruiterId FK
        date scheduledAt
        number durationMinutes
        string type "VIDEO | PHONE | IN_PERSON | TECHNICAL_ASSESSMENT"
        string meetingLink
        string status "SCHEDULED | RESCHEDULED | COMPLETED | CANCELLED"
    }
```

---

## Collections & Index Catalog

| Collection | Key Primary Query Patterns | Configured Indexes |
|:-----------|:---------------------------|:-------------------|
| **`users`** | Auth login, email validation, role filters | `{ email: 1 }` (unique), `{ role: 1 }`, `{ isActive: 1, isVerified: 1 }` |
| **`studentProfiles`** | Skill matching, candidate search | `{ userId: 1 }` (unique), `{ skills: 1 }`, Text index on `{ headline, bio, skills }` |
| **`companies`** | Directory listing, recruiter verification | `{ slug: 1 }` (unique), `{ ownerId: 1 }`, `{ industry: 1, verified: 1 }`, Text search |
| **`internships`** | Search, filter by workplace/skills, deadline | `{ slug: 1 }` (unique), `{ companyId: 1, status: 1 }`, `{ status: 1, applicationDeadline: 1 }`, `{ status: 1, remote: 1, createdAt: -1 }`, Full-text index `{ title: 10, skills: 6, description: 1 }` |
| **`applications`** | Duplicate prevention, dashboard queries | `{ internshipId: 1, studentId: 1 }` (unique), `{ studentId: 1, status: 1, createdAt: -1 }`, `{ companyId: 1, status: 1, createdAt: -1 }` |
| **`interviews`** | Calendar timelines, candidate scheduling | `{ studentId: 1, scheduledAt: 1, status: 1 }`, `{ companyId: 1, scheduledAt: 1, status: 1 }`, `{ recruiterId: 1, scheduledAt: 1 }` |
| **`notifications`** | Unread badges, chronologic alert feeds | `{ userId: 1, read: 1, createdAt: -1 }`, `{ userId: 1, type: 1, createdAt: -1 }` |
| **`savedInternships`** | User bookmark library | `{ userId: 1, internshipId: 1 }` (unique) |
| **`auditLogs`** | Security audit trails & compliance | `{ actorId: 1, action: 1, createdAt: -1 }`, `{ targetModel: 1, targetId: 1 }` |
