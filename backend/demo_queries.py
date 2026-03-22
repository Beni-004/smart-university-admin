"""
demo_queries.py — Hardcoded SQL queries for the Review 2 DBMS Demo tab.

All 10 categories, 26 queries total — mapped to sections 3.1, 3.2, 3.3.
SQL sourced from review2_queries.sql.
"""

DEMO_QUERIES = {

    # ==================================================================
    # SECTION 3.1 — Aggregate Functions, Constraints & Set Operations
    # ==================================================================

    "constraints": {
        "label": "Constraints",
        "section": "3.1",
        "queries": [
            {
                # 3.1.7  CONSTRAINT DEMO — catalog lookup
                "title": "Constraint Catalog Lookup (NOT NULL, UNIQUE, CHECK, FK)",
                "question": "What constraints are defined on the public schema tables?",
                "sql": """SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints  tc
JOIN information_schema.key_column_usage  kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;"""
            },
        ],
    },

    "aggregates": {
        "label": "Aggregate Functions",
        "section": "3.1",
        "queries": [
            {
                # 3.1.1  COUNT
                "title": "COUNT — Total Students per Department",
                "question": "How many students are in each department?",
                "sql": """SELECT
    d.name                  AS department,
    COUNT(s.id)             AS total_students
FROM departments d
LEFT JOIN students s ON s.department_id = d.id
GROUP BY d.name
ORDER BY total_students DESC;"""
            },
            {
                # 3.1.2  AVG with GROUP BY
                "title": "AVG + GROUP BY — Average GPA per Department",
                "question": "What is the average GPA per department?",
                "sql": """SELECT
    d.name                          AS department,
    ROUND(AVG(s.gpa)::NUMERIC, 2)  AS avg_gpa
FROM students s
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
ORDER BY avg_gpa DESC;"""
            },
            {
                # 3.1.3  HAVING
                "title": "HAVING — Departments with Average GPA > 3.0",
                "question": "Which departments have an average GPA exceeding 3.0?",
                "sql": """SELECT
    d.name                          AS department,
    ROUND(AVG(s.gpa)::NUMERIC, 2)  AS avg_gpa
FROM students s
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
HAVING AVG(s.gpa) > 3.0
ORDER BY avg_gpa DESC;"""
            },
            {
                # 3.1.4  MAX / MIN
                "title": "MAX / MIN — Highest and Lowest GPA per Department",
                "question": "What are the highest and lowest GPAs in each department?",
                "sql": """SELECT
    d.name          AS department,
    MAX(s.gpa)      AS highest_gpa,
    MIN(s.gpa)      AS lowest_gpa
FROM students s
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
ORDER BY d.name;"""
            },
            {
                # 3.1.5  SUM
                "title": "SUM — Total Placement Package per Department",
                "question": "What is the total placement package secured per department?",
                "sql": """SELECT
    d.name                              AS department,
    ROUND(SUM(p.package)::NUMERIC, 2)  AS total_package_lpa,
    COUNT(p.id)                         AS placed_students
FROM placements p
JOIN students s  ON p.student_id  = s.id
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
ORDER BY total_package_lpa DESC;"""
            },
            {
                # 3.1.6  HAVING with COUNT
                "title": "HAVING + COUNT — Departments with > 5 Placements",
                "question": "Which departments have more than 5 students placed?",
                "sql": """SELECT
    d.name          AS department,
    COUNT(p.id)     AS placements
FROM placements p
JOIN students   s ON p.student_id   = s.id
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
HAVING COUNT(p.id) > 5
ORDER BY placements DESC;"""
            },
        ],
    },

    "sets": {
        "label": "Set Operations",
        "section": "3.1",
        "queries": [
            {
                # 3.1.8  UNION
                "title": "UNION — CS-Enrolled OR Placed Students",
                "question": "Which students are enrolled in a CS course or have been placed?",
                "sql": """SELECT s.name, s.roll_number, 'Enrolled in CS Course' AS status
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c     ON e.course_id = c.id
JOIN departments d ON c.department_id = d.id
WHERE d.name ILIKE '%computer%'

UNION

SELECT s.name, s.roll_number, 'Placed' AS status
FROM students s
JOIN placements p ON s.id = p.student_id
ORDER BY name;"""
            },
            {
                # 3.1.9  INTERSECT
                "title": "INTERSECT — CS-Enrolled AND Placed Students",
                "question": "Which students are both enrolled in a CS course and placed?",
                "sql": """SELECT s.name, s.roll_number
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c     ON e.course_id = c.id
JOIN departments d ON c.department_id = d.id
WHERE d.name ILIKE '%computer%'

INTERSECT

SELECT s.name, s.roll_number
FROM students s
JOIN placements p ON s.id = p.student_id;"""
            },
            {
                # 3.1.10  EXCEPT
                "title": "EXCEPT — CS-Enrolled but NOT Placed Students",
                "question": "Which students are enrolled in a CS course but have not been placed?",
                "sql": """SELECT s.name, s.roll_number
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c     ON e.course_id = c.id
JOIN departments d ON c.department_id = d.id
WHERE d.name ILIKE '%computer%'

EXCEPT

SELECT s.name, s.roll_number
FROM students s
JOIN placements p ON s.id = p.student_id;"""
            },
        ],
    },

    # ==================================================================
    # SECTION 3.2 — Subqueries, Joins & Views
    # ==================================================================

    "joins": {
        "label": "Joins",
        "section": "3.2",
        "queries": [
            {
                # 3.2.1  INNER JOIN
                "title": "INNER JOIN — Students with Department Names",
                "question": "List all students with their department names.",
                "sql": """SELECT
    s.roll_number,
    s.name          AS student_name,
    s.gpa,
    d.name          AS department
FROM students s
INNER JOIN departments d ON s.department_id = d.id
ORDER BY s.gpa DESC;"""
            },
            {
                # 3.2.2  LEFT JOIN
                "title": "LEFT JOIN — All Departments Including Empty Ones",
                "question": "Show all departments, including those with no students enrolled.",
                "sql": """SELECT
    d.name              AS department,
    COUNT(s.id)         AS student_count
FROM departments d
LEFT JOIN students s ON s.department_id = d.id
GROUP BY d.name
ORDER BY student_count DESC;"""
            },
            {
                # 3.2.3  RIGHT JOIN
                "title": "RIGHT JOIN — All Students with Placement Status",
                "question": "Show all students, including those with no placement record.",
                "sql": """SELECT
    s.name          AS student_name,
    s.roll_number,
    p.company_name,
    p.package
FROM placements p
RIGHT JOIN students s ON p.student_id = s.id
ORDER BY s.name;"""
            },
            {
                # 3.2.4  MULTI-TABLE JOIN
                "title": "Multi-Table JOIN — Student, Course, Grade, Attendance",
                "question": "Show each student's course grades and attendance percentage.",
                "sql": """SELECT
    s.name                                                      AS student,
    d.name                                                      AS department,
    c.course_name,
    g.grade,
    g.score,
    ROUND(
        100.0 * SUM(CASE WHEN a.present THEN 1 ELSE 0 END)
                / NULLIF(COUNT(a.id), 0)
    , 1)                                                        AS attendance_pct
FROM students    s
JOIN departments d  ON s.department_id  = d.id
JOIN enrollments e  ON e.student_id     = s.id
JOIN courses     c  ON e.course_id      = c.id
LEFT JOIN grades g  ON g.student_id     = s.id AND g.course_id = c.id
LEFT JOIN attendance a ON a.student_id  = s.id AND a.course_id = c.id
GROUP BY s.name, d.name, c.course_name, g.grade, g.score
ORDER BY s.name, c.course_name;"""
            },
        ],
    },

    "subqueries": {
        "label": "Subqueries",
        "section": "3.2",
        "queries": [
            {
                # 3.2.5  NESTED SUBQUERY
                "title": "Nested Subquery — Students Above Overall Average GPA",
                "question": "Which students have a GPA above the overall average?",
                "sql": """SELECT
    s.name          AS student_name,
    s.roll_number,
    s.gpa
FROM students s
WHERE s.gpa > (
    SELECT AVG(gpa) FROM students
)
ORDER BY s.gpa DESC;"""
            },
            {
                # 3.2.6  CORRELATED SUBQUERY
                "title": "Correlated Subquery — GPA vs Department Average",
                "question": "For each student, is their GPA above their department's average?",
                "sql": """SELECT
    s.name          AS student_name,
    d.name          AS department,
    s.gpa,
    ROUND((
        SELECT AVG(s2.gpa)
        FROM   students s2
        WHERE  s2.department_id = s.department_id
    )::NUMERIC, 2)  AS dept_avg_gpa,
    CASE
        WHEN s.gpa > (
            SELECT AVG(s2.gpa)
            FROM   students s2
            WHERE  s2.department_id = s.department_id
        ) THEN 'Above Average'
        ELSE 'Below / At Average'
    END             AS performance
FROM students    s
JOIN departments d ON s.department_id = d.id
ORDER BY d.name, s.gpa DESC;"""
            },
            {
                # 3.2.7  SUBQUERY WITH IN
                "title": "Subquery with IN — Students Who Scored > 90",
                "question": "Which students scored above 90 in any exam?",
                "sql": """SELECT
    s.name,
    s.roll_number,
    d.name AS department
FROM students s
JOIN departments d ON s.department_id = d.id
WHERE s.id IN (
    SELECT DISTINCT student_id
    FROM   grades
    WHERE  score > 90
)
ORDER BY s.name;"""
            },
            {
                # 3.2.8  SUBQUERY WITH EXISTS
                "title": "Subquery with EXISTS — Departments with 10+ LPA Placements",
                "question": "Which departments have at least one student placed above 10 LPA?",
                "sql": """SELECT DISTINCT d.name AS department
FROM departments d
WHERE EXISTS (
    SELECT 1
    FROM   students  s
    JOIN   placements p ON p.student_id = s.id
    WHERE  s.department_id = d.id
      AND  p.package > 10.0
);"""
            },
        ],
    },

    "views": {
        "label": "Views",
        "section": "3.2",
        "queries": [
            {
                # 3.2.9  VIEW 1 — student_performance_view
                "title": "View — Student Performance (GPA + Placement)",
                "question": "Show placed students with their GPA and package details.",
                "sql": """SELECT * FROM student_performance_view
WHERE package_lpa > 0
ORDER BY package_lpa DESC;"""
            },
            {
                # 3.2.10  VIEW 2 — low_attendance_view
                "title": "View — Low Attendance (Below 75%)",
                "question": "Which students have course-wise attendance below 75%?",
                "sql": """SELECT * FROM low_attendance_view
ORDER BY attendance_pct;"""
            },
            {
                # 3.2.11  VIEW 3 — dept_placement_summary_view
                "title": "View — Department Placement Summary",
                "question": "What are the placement statistics per department?",
                "sql": """SELECT * FROM dept_placement_summary_view
ORDER BY placement_pct DESC;"""
            },
        ],
    },

    # ==================================================================
    # SECTION 3.3 — Functions, Triggers, Cursors & Exception Handling
    # ==================================================================

    "triggers": {
        "label": "Triggers",
        "section": "3.3",
        "queries": [
            {
                # 3.3.3  TRIGGER — GPA audit log (read-only)
                "title": "Trigger — GPA Audit Log (trg_gpa_audit)",
                "question": "Show the GPA change audit trail recorded by the trigger.",
                "sql": """SELECT * FROM gpa_audit_log
ORDER BY changed_at DESC;"""
            },
            {
                # 3.3.4  TRIGGER — Show trigger definitions from catalog
                "title": "Trigger Definitions — pg_catalog Lookup",
                "question": "What triggers are defined on public tables?",
                "sql": """SELECT
    tg.tgname       AS trigger_name,
    cl.relname      AS table_name,
    CASE tg.tgtype & 66
        WHEN 2  THEN 'BEFORE'
        WHEN 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END             AS timing,
    CASE
        WHEN tg.tgtype & 4  > 0 THEN 'INSERT'
        WHEN tg.tgtype & 8  > 0 THEN 'DELETE'
        WHEN tg.tgtype & 16 > 0 THEN 'UPDATE'
    END             AS event,
    p.proname       AS function_name
FROM pg_trigger     tg
JOIN pg_class       cl ON tg.tgrelid  = cl.oid
JOIN pg_namespace   ns ON cl.relnamespace = ns.oid
JOIN pg_proc        p  ON tg.tgfoid    = p.oid
WHERE NOT tg.tgisinternal
  AND ns.nspname = 'public'
ORDER BY cl.relname, tg.tgname;"""
            },
        ],
    },

    "functions": {
        "label": "Functions",
        "section": "3.3",
        "queries": [
            {
                # 3.3.1  FUNCTION — get_student_gpa_category
                "title": "Function — get_student_gpa_category()",
                "question": "What GPA category does student RA2301001CS001 fall into?",
                "sql": """SELECT get_student_gpa_category('RA2301001CS001') AS gpa_category;"""
            },
            {
                # 3.3.2  FUNCTION — get_dept_placement_rate
                "title": "Function — get_dept_placement_rate()",
                "question": "What is the placement rate for the Computer Science department?",
                "sql": """SELECT get_dept_placement_rate('Computer Science') AS placement_rate_pct;"""
            },
        ],
    },

    "cursors": {
        "label": "Cursors",
        "section": "3.3",
        "queries": [
            {
                # 3.3.5  CURSOR equivalent — student GPA categories
                "title": "Cursor Demo — Student GPA Categories by Department",
                "question": "List all students with their GPA category, ordered by department.",
                "sql": """SELECT
    s.name          AS student_name,
    s.gpa,
    d.name          AS department,
    CASE
        WHEN s.gpa >= 3.7 THEN 'Distinction'
        WHEN s.gpa >= 3.3 THEN 'First Class'
        WHEN s.gpa >= 3.0 THEN 'Second Class'
        WHEN s.gpa >= 2.0 THEN 'Pass'
        ELSE 'Fail'
    END             AS gpa_category
FROM students    s
JOIN departments d ON s.department_id = d.id
ORDER BY d.name, s.gpa DESC;"""
            },
            {
                # 3.3.6  CURSOR equivalent — credit load check
                "title": "Cursor Demo — Student Credit Load Check",
                "question": "Which students are under-loaded (below 12 credits)?",
                "sql": """SELECT
    s.name          AS student_name,
    s.roll_number,
    SUM(c.credits)  AS total_credits,
    CASE
        WHEN SUM(c.credits) < 12 THEN 'UNDER-LOADED'
        ELSE 'OK'
    END             AS load_status
FROM students    s
JOIN enrollments e ON e.student_id = s.id
JOIN courses     c ON e.course_id  = c.id
GROUP BY s.id, s.name, s.roll_number
ORDER BY total_credits;"""
            },
        ],
    },

    "exceptions": {
        "label": "Exception Handling",
        "section": "3.3",
        "queries": [
            {
                # 3.3.7  EXCEPTION — safe_get_student (returns TABLE, safe to call)
                "title": "Exception Handling — safe_get_student() (valid roll)",
                "question": "Safely look up student RA2301001CS001 with error handling.",
                "sql": """SELECT * FROM safe_get_student('RA2301001CS001');"""
            },
            {
                # 3.3.8  FUNCTION + EXCEPTION — enroll_student_safe (read-only: show source)
                "title": "Exception Handling — enroll_student_safe() Source Code",
                "question": "Show the source code of the enroll_student_safe function with its exception handlers.",
                "sql": """SELECT
    p.proname       AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'enroll_student_safe';"""
            },
        ],
    },
}
