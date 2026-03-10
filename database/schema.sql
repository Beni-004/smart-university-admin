-- SQLite-compatible schema (converted from PostgreSQL)

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS placements;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS hostels;
DROP TABLE IF EXISTS departments;

-- Create departments table
CREATE TABLE departments (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    hod_name TEXT,
    building TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create hostels table
CREATE TABLE hostels (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    warden_name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE students (
    id           INTEGER PRIMARY KEY,
    roll_number  TEXT NOT NULL UNIQUE,
    name         TEXT NOT NULL,
    email        TEXT UNIQUE,
    phone        TEXT,
    department_id INTEGER REFERENCES departments(id),
    hostel_id    INTEGER REFERENCES hostels(id),
    gpa          REAL CHECK (gpa >= 0 AND gpa <= 4.0),
    admission_year INTEGER,
    created_at   TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE courses (
    id          INTEGER PRIMARY KEY,
    course_code TEXT NOT NULL UNIQUE,
    course_name TEXT NOT NULL,
    credits     INTEGER NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    semester    INTEGER,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create enrollments table
CREATE TABLE enrollments (
    id              INTEGER PRIMARY KEY,
    student_id      INTEGER REFERENCES students(id),
    course_id       INTEGER REFERENCES courses(id),
    enrollment_date TEXT DEFAULT CURRENT_DATE,
    UNIQUE(student_id, course_id)
);

-- Create attendance table
CREATE TABLE attendance (
    id         INTEGER PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id  INTEGER REFERENCES courses(id),
    date       TEXT NOT NULL,
    present    INTEGER NOT NULL,  -- 1 = present, 0 = absent
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, date)
);

-- Create grades table
CREATE TABLE grades (
    id         INTEGER PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id  INTEGER REFERENCES courses(id),
    exam_type  TEXT,   -- Midterm, Final, Quiz
    score      REAL CHECK (score >= 0 AND score <= 100),
    grade      TEXT,   -- A+, A, B+, etc.
    exam_date  TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create placements table
CREATE TABLE placements (
    id              INTEGER PRIMARY KEY,
    student_id      INTEGER REFERENCES students(id),
    company_name    TEXT NOT NULL,
    job_role        TEXT,
    package         REAL,  -- in lakhs per annum
    placement_date  TEXT,
    created_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_hostel     ON students(hostel_id);
CREATE INDEX idx_students_gpa        ON students(gpa);
CREATE INDEX idx_attendance_student  ON attendance(student_id);
CREATE INDEX idx_attendance_date     ON attendance(date);
CREATE INDEX idx_grades_student      ON grades(student_id);
CREATE INDEX idx_placements_student  ON placements(student_id);

