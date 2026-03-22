from vector_store import VectorStore

ddls = {
    "departments": """CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    hod_name VARCHAR(100),
    building VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);""",
    "hostels": """CREATE TABLE hostels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    warden_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);""",
    "students": """CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    department_id INTEGER REFERENCES departments(id),
    hostel_id INTEGER REFERENCES hostels(id),
    gpa DECIMAL(3, 2) CHECK (gpa >= 0 AND gpa <= 4.0),
    admission_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);""",
    "courses": """CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(200) NOT NULL,
    credits INTEGER NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    semester INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);""",
    "enrollments": """CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(student_id, course_id)
);""",
    "attendance": """CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    date DATE NOT NULL,
    present BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, date)
);""",
    "grades": """CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    exam_type VARCHAR(50),
    score DECIMAL(5, 2) CHECK (score >= 0 AND score <= 100),
    grade VARCHAR(2),
    exam_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);""",
    "placements": """CREATE TABLE placements (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    company_name VARCHAR(200) NOT NULL,
    job_role VARCHAR(100),
    package DECIMAL(10, 2),
    placement_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"""
}

q_sql_pairs = [
    ("Total number of students per department", "SELECT d.name AS department, COUNT(s.id) AS total_students FROM departments d LEFT JOIN students s ON s.department_id = d.id GROUP BY d.name ORDER BY total_students DESC;"),
    ("Average GPA per department", "SELECT d.name AS department, ROUND(AVG(s.gpa)::NUMERIC, 2) AS avg_gpa FROM students s JOIN departments d ON s.department_id = d.id GROUP BY d.name ORDER BY avg_gpa DESC;"),
    ("Departments where average GPA exceeds 3.0", "SELECT d.name AS department, ROUND(AVG(s.gpa)::NUMERIC, 2) AS avg_gpa FROM students s JOIN departments d ON s.department_id = d.id GROUP BY d.name HAVING AVG(s.gpa) > 3.0 ORDER BY avg_gpa DESC;"),
    ("Highest and lowest GPA per department", "SELECT d.name AS department, MAX(s.gpa) AS highest_gpa, MIN(s.gpa) AS lowest_gpa FROM students s JOIN departments d ON s.department_id = d.id GROUP BY d.name ORDER BY d.name;"),
    ("Total placement package secured per department", "SELECT d.name AS department, ROUND(SUM(p.package)::NUMERIC, 2) AS total_package_lpa, COUNT(p.id) AS placed_students FROM placements p JOIN students s ON p.student_id = s.id JOIN departments d ON s.department_id = d.id GROUP BY d.name ORDER BY total_package_lpa DESC;"),
    ("Departments with more than 5 students placed", "SELECT d.name AS department, COUNT(p.id) AS placements FROM placements p JOIN students s ON p.student_id = s.id JOIN departments d ON s.department_id = d.id GROUP BY d.name HAVING COUNT(p.id) > 5 ORDER BY placements DESC;"),
    ("Students enrolled in CS courses OR placed in companies", "SELECT s.name, s.roll_number, 'Enrolled in CS Course' AS status FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id JOIN departments d ON c.department_id = d.id WHERE d.name ILIKE '%computer%' UNION SELECT s.name, s.roll_number, 'Placed' AS status FROM students s JOIN placements p ON s.id = p.student_id ORDER BY name;"),
    ("Students who are BOTH enrolled in a CS course AND placed", "SELECT s.name, s.roll_number FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id JOIN departments d ON c.department_id = d.id WHERE d.name ILIKE '%computer%' INTERSECT SELECT s.name, s.roll_number FROM students s JOIN placements p ON s.id = p.student_id;"),
    ("Students enrolled in CS courses but NOT yet placed", "SELECT s.name, s.roll_number FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id JOIN departments d ON c.department_id = d.id WHERE d.name ILIKE '%computer%' EXCEPT SELECT s.name, s.roll_number FROM students s JOIN placements p ON s.id = p.student_id;"),
    ("Students with their department names", "SELECT s.roll_number, s.name AS student_name, s.gpa, d.name AS department FROM students s INNER JOIN departments d ON s.department_id = d.id ORDER BY s.gpa DESC;"),
    ("All departments, including those with no students enrolled", "SELECT d.name AS department, COUNT(s.id) AS student_count FROM departments d LEFT JOIN students s ON s.department_id = d.id GROUP BY d.name ORDER BY student_count DESC;"),
    ("All students including those with no placement record", "SELECT s.name AS student_name, s.roll_number, p.company_name, p.package FROM placements p RIGHT JOIN students s ON p.student_id = s.id ORDER BY s.name;"),
    ("Students with GPA above the overall average GPA", "SELECT s.name AS student_name, s.roll_number, s.gpa FROM students s WHERE s.gpa > (SELECT AVG(gpa) FROM students) ORDER BY s.gpa DESC;"),
    ("For each student, show whether their GPA is above their department's average", "SELECT s.name AS student_name, d.name AS department, s.gpa, ROUND((SELECT AVG(s2.gpa) FROM students s2 WHERE s2.department_id = s.department_id)::NUMERIC, 2) AS dept_avg_gpa, CASE WHEN s.gpa > (SELECT AVG(s2.gpa) FROM students s2 WHERE s2.department_id = s.department_id) THEN 'Above Average' ELSE 'Below / At Average' END AS performance FROM students s JOIN departments d ON s.department_id = d.id ORDER BY d.name, s.gpa DESC;"),
    ("Students who scored > 90 in any exam", "SELECT s.name, s.roll_number, d.name AS department FROM students s JOIN departments d ON s.department_id = d.id WHERE s.id IN (SELECT DISTINCT student_id FROM grades WHERE score > 90) ORDER BY s.name;")
]

docs = [
    "GPA categories: 'Distinction' (>= 3.7), 'First Class' (>= 3.3), 'Second Class' (>= 3.0), 'Pass' (>= 2.0), 'Fail' (< 2.0)",
    "Attendance threshold: Students must maintain at least 75% attendance to avoid being flagged.",
    "Placement package unit: Placement packages are measured in LPA (Lakhs Per Annum)."
]

def seed_database():
    print("⏳ Starting data seed...")
    try:
        store = VectorStore()
    except Exception as e:
        print(f"❌ Aborting seed because VectorStore failed to load: {e}")
        return
    
    store.reset_collection("ddl")
    store.reset_collection("question_sql")
    store.reset_collection("documentation")
    
    for table_name, ddl in ddls.items():
        store.add_ddl(table_name, ddl)
        
    for q, sql in q_sql_pairs:
        store.add_question_sql(q, sql)
        
    for doc in docs:
        store.add_doc(doc)
        
    print("✅ Finished data seed.")
    
    # Verify counts
    print(f"Collection 'ddl' count: {store.ddl.count()}")
    print(f"Collection 'question_sql' count: {store.question_sql.count()}")
    print(f"Collection 'documentation' count: {store.documentation.count()}")

if __name__ == "__main__":
    seed_database()
