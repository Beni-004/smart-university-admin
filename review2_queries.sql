-- ============================================================
-- Smart University Admin — Review 2 SQL Queries
-- Course: 21CSC205P Database Management Systems
-- ============================================================


-- ============================================================
-- SECTION 3.1 — Aggregate Functions, Constraints & Set Operations
-- ============================================================


-- ------------------------------------------------------------
-- 3.1.1  COUNT — Total number of students per department
-- ------------------------------------------------------------
SELECT
    d.name                  AS department,
    COUNT(s.id)             AS total_students
FROM departments d
LEFT JOIN students s ON s.department_id = d.id
GROUP BY d.name
ORDER BY total_students DESC;


-- ------------------------------------------------------------
-- 3.1.2  AVG with GROUP BY — Average GPA per department
-- ------------------------------------------------------------
SELECT
    d.name                          AS department,
    ROUND(AVG(s.gpa)::NUMERIC, 2)  AS avg_gpa
FROM students s
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
ORDER BY avg_gpa DESC;


-- ------------------------------------------------------------
-- 3.1.3  HAVING — Departments where average GPA exceeds 3.0
-- ------------------------------------------------------------
SELECT
    d.name                          AS department,
    ROUND(AVG(s.gpa)::NUMERIC, 2)  AS avg_gpa
FROM students s
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
HAVING AVG(s.gpa) > 3.0
ORDER BY avg_gpa DESC;


-- ------------------------------------------------------------
-- 3.1.4  MAX / MIN — Highest and lowest GPA per department
-- ------------------------------------------------------------
SELECT
    d.name          AS department,
    MAX(s.gpa)      AS highest_gpa,
    MIN(s.gpa)      AS lowest_gpa
FROM students s
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
ORDER BY d.name;


-- ------------------------------------------------------------
-- 3.1.5  SUM — Total placement package secured per department
-- ------------------------------------------------------------
SELECT
    d.name                              AS department,
    ROUND(SUM(p.package)::NUMERIC, 2)  AS total_package_lpa,
    COUNT(p.id)                         AS placed_students
FROM placements p
JOIN students s  ON p.student_id  = s.id
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
ORDER BY total_package_lpa DESC;


-- ------------------------------------------------------------
-- 3.1.6  HAVING with COUNT — Departments with more than 5
--         students placed
-- ------------------------------------------------------------
SELECT
    d.name          AS department,
    COUNT(p.id)     AS placements
FROM placements p
JOIN students   s ON p.student_id   = s.id
JOIN departments d ON s.department_id = d.id
GROUP BY d.name
HAVING COUNT(p.id) > 5
ORDER BY placements DESC;


-- ------------------------------------------------------------
-- 3.1.7  CONSTRAINT DEMO — NOT NULL, UNIQUE, CHECK, FK
--        (Schema already enforces these; queries below
--         demonstrate violations being rejected)
-- ------------------------------------------------------------

-- Show CHECK constraint on gpa (0.0 – 4.0):
-- INSERT INTO students(roll_number, name, gpa)
-- VALUES ('RA9999', 'Test', 5.0);   -- ❌ violates CHECK

-- Show UNIQUE constraint on roll_number:
-- INSERT INTO students(roll_number, name)
-- VALUES ('RA2301001CS001', 'Duplicate');  -- ❌ violates UNIQUE

-- Safe read: confirm constraints exist via catalog
SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints  tc
JOIN information_schema.key_column_usage  kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;


-- ------------------------------------------------------------
-- 3.1.8  SET OPERATION — UNION
--        Students enrolled in CS courses OR placed in companies
-- ------------------------------------------------------------
SELECT s.name, s.roll_number, 'Enrolled in CS Course' AS status
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c     ON e.course_id = c.id
JOIN departments d ON c.department_id = d.id
WHERE d.name ILIKE '%computer%'

UNION

SELECT s.name, s.roll_number, 'Placed' AS status
FROM students s
JOIN placements p ON s.id = p.student_id
ORDER BY name;


-- ------------------------------------------------------------
-- 3.1.9  SET OPERATION — INTERSECT
--        Students who are BOTH enrolled in a CS course AND placed
-- ------------------------------------------------------------
SELECT s.name, s.roll_number
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c     ON e.course_id = c.id
JOIN departments d ON c.department_id = d.id
WHERE d.name ILIKE '%computer%'

INTERSECT

SELECT s.name, s.roll_number
FROM students s
JOIN placements p ON s.id = p.student_id;


-- ------------------------------------------------------------
-- 3.1.10  SET OPERATION — EXCEPT
--         Students enrolled in CS courses but NOT yet placed
-- ------------------------------------------------------------
SELECT s.name, s.roll_number
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c     ON e.course_id = c.id
JOIN departments d ON c.department_id = d.id
WHERE d.name ILIKE '%computer%'

EXCEPT

SELECT s.name, s.roll_number
FROM students s
JOIN placements p ON s.id = p.student_id;


-- ============================================================
-- SECTION 3.2 — Subqueries, Joins & Views
-- ============================================================


-- ------------------------------------------------------------
-- 3.2.1  INNER JOIN — Students with their department names
-- ------------------------------------------------------------
SELECT
    s.roll_number,
    s.name          AS student_name,
    s.gpa,
    d.name          AS department
FROM students s
INNER JOIN departments d ON s.department_id = d.id
ORDER BY s.gpa DESC;


-- ------------------------------------------------------------
-- 3.2.2  LEFT JOIN — All departments, including those with
--         no students enrolled
-- ------------------------------------------------------------
SELECT
    d.name              AS department,
    COUNT(s.id)         AS student_count
FROM departments d
LEFT JOIN students s ON s.department_id = d.id
GROUP BY d.name
ORDER BY student_count DESC;


-- ------------------------------------------------------------
-- 3.2.3  RIGHT JOIN — All students including those with no
--         placement record
-- ------------------------------------------------------------
SELECT
    s.name          AS student_name,
    s.roll_number,
    p.company_name,
    p.package
FROM placements p
RIGHT JOIN students s ON p.student_id = s.id
ORDER BY s.name;


-- ------------------------------------------------------------
-- 3.2.4  MULTI-TABLE JOIN — Student → Course → Grade with
--         department and attendance %
-- ------------------------------------------------------------
SELECT
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
ORDER BY s.name, c.course_name;


-- ------------------------------------------------------------
-- 3.2.5  NESTED SUBQUERY — Students with GPA above the
--         overall average GPA
-- ------------------------------------------------------------
SELECT
    s.name          AS student_name,
    s.roll_number,
    s.gpa
FROM students s
WHERE s.gpa > (
    SELECT AVG(gpa) FROM students
)
ORDER BY s.gpa DESC;


-- ------------------------------------------------------------
-- 3.2.6  CORRELATED SUBQUERY — For each student, show whether
--         their GPA is above their department's average
-- ------------------------------------------------------------
SELECT
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
ORDER BY d.name, s.gpa DESC;


-- ------------------------------------------------------------
-- 3.2.7  SUBQUERY WITH IN — Students who scored > 90 in
--         any exam
-- ------------------------------------------------------------
SELECT
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
ORDER BY s.name;


-- ------------------------------------------------------------
-- 3.2.8  SUBQUERY WITH EXISTS — Departments that have at
--         least one student placed above 10 LPA
-- ------------------------------------------------------------
SELECT DISTINCT d.name AS department
FROM departments d
WHERE EXISTS (
    SELECT 1
    FROM   students  s
    JOIN   placements p ON p.student_id = s.id
    WHERE  s.department_id = d.id
      AND  p.package > 10.0
);


-- ------------------------------------------------------------
-- 3.2.9  VIEW 1 — student_performance_view
--         Reusable view combining student, dept, GPA, placement
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW student_performance_view AS
SELECT
    s.id                                AS student_id,
    s.roll_number,
    s.name                              AS student_name,
    d.name                              AS department,
    s.gpa,
    COALESCE(p.company_name, 'Not Placed')  AS placement_company,
    COALESCE(p.package, 0)              AS package_lpa
FROM students    s
JOIN departments d  ON s.department_id = d.id
LEFT JOIN placements p ON p.student_id = s.id;

-- Query the view:
SELECT * FROM student_performance_view WHERE package_lpa > 0 ORDER BY package_lpa DESC;


-- ------------------------------------------------------------
-- 3.2.10  VIEW 2 — low_attendance_view
--          Students with course-wise attendance below 75 %
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW low_attendance_view AS
SELECT
    s.name          AS student_name,
    s.roll_number,
    d.name          AS department,
    c.course_name,
    ROUND(
        100.0 * SUM(CASE WHEN a.present THEN 1 ELSE 0 END)
                / NULLIF(COUNT(a.id), 0)
    , 1)            AS attendance_pct
FROM attendance  a
JOIN students    s ON a.student_id  = s.id
JOIN courses     c ON a.course_id   = c.id
JOIN departments d ON s.department_id = d.id
GROUP BY s.name, s.roll_number, d.name, c.course_name
HAVING ROUND(
    100.0 * SUM(CASE WHEN a.present THEN 1 ELSE 0 END)
            / NULLIF(COUNT(a.id), 0)
, 1) < 75;

-- Query the view:
SELECT * FROM low_attendance_view ORDER BY attendance_pct;


-- ------------------------------------------------------------
-- 3.2.11  VIEW 3 — dept_placement_summary_view
--          Department-level placement statistics
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW dept_placement_summary_view AS
SELECT
    d.name                              AS department,
    COUNT(DISTINCT s.id)                AS total_students,
    COUNT(DISTINCT p.student_id)        AS placed_students,
    ROUND(
        100.0 * COUNT(DISTINCT p.student_id)
              / NULLIF(COUNT(DISTINCT s.id), 0)
    , 1)                                AS placement_pct,
    ROUND(AVG(p.package)::NUMERIC, 2)  AS avg_package_lpa,
    MAX(p.package)                      AS highest_package_lpa
FROM departments d
LEFT JOIN students   s ON s.department_id = d.id
LEFT JOIN placements p ON p.student_id    = s.id
GROUP BY d.name;

-- Query the view:
SELECT * FROM dept_placement_summary_view ORDER BY placement_pct DESC;


-- ============================================================
-- SECTION 3.3 — Functions, Triggers, Cursors & Exception Handling
-- ============================================================


-- ------------------------------------------------------------
-- 3.3.1  FUNCTION — get_student_gpa_category
--         Returns grade category (Distinction / First / etc.)
--         based on GPA for a given student roll number
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_student_gpa_category(p_roll VARCHAR)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_gpa   DECIMAL(3,2);
    v_cat   TEXT;
BEGIN
    SELECT gpa INTO v_gpa
    FROM   students
    WHERE  roll_number = p_roll;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student with roll number % not found', p_roll;
    END IF;

    v_cat := CASE
        WHEN v_gpa >= 3.7 THEN 'Distinction'
        WHEN v_gpa >= 3.3 THEN 'First Class'
        WHEN v_gpa >= 3.0 THEN 'Second Class'
        WHEN v_gpa >= 2.0 THEN 'Pass'
        ELSE 'Fail'
    END;

    RETURN v_cat;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in get_student_gpa_category: %', SQLERRM;
        RETURN 'Error';
END;
$$;

-- Usage:
-- SELECT get_student_gpa_category('RA2301001CS001');


-- ------------------------------------------------------------
-- 3.3.2  FUNCTION — get_dept_placement_rate
--         Returns placement percentage for a given department
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dept_placement_rate(p_dept_name VARCHAR)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_total     INTEGER;
    v_placed    INTEGER;
    v_rate      NUMERIC;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM   students s
    JOIN   departments d ON s.department_id = d.id
    WHERE  d.name ILIKE p_dept_name;

    IF v_total = 0 THEN
        RAISE EXCEPTION 'Department "%" not found or has no students', p_dept_name;
    END IF;

    SELECT COUNT(DISTINCT p.student_id) INTO v_placed
    FROM   placements p
    JOIN   students   s ON p.student_id   = s.id
    JOIN   departments d ON s.department_id = d.id
    WHERE  d.name ILIKE p_dept_name;

    v_rate := ROUND(100.0 * v_placed / v_total, 2);
    RETURN v_rate;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN -1;
END;
$$;

-- Usage:
-- SELECT get_dept_placement_rate('Computer Science');


-- ------------------------------------------------------------
-- 3.3.3  TRIGGER — log_gpa_update
--         Automatically logs any GPA change in an audit table
-- ------------------------------------------------------------

-- Audit table (run once):
CREATE TABLE IF NOT EXISTS gpa_audit_log (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER,
    roll_number     VARCHAR(20),
    old_gpa         DECIMAL(3,2),
    new_gpa         DECIMAL(3,2),
    changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by      TEXT DEFAULT current_user
);

-- Trigger function:
CREATE OR REPLACE FUNCTION fn_log_gpa_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.gpa IS DISTINCT FROM NEW.gpa THEN
        INSERT INTO gpa_audit_log(student_id, roll_number, old_gpa, new_gpa)
        VALUES (OLD.id, OLD.roll_number, OLD.gpa, NEW.gpa);
    END IF;
    RETURN NEW;
END;
$$;

-- Attach trigger:
DROP TRIGGER IF EXISTS trg_gpa_audit ON students;
CREATE TRIGGER trg_gpa_audit
AFTER UPDATE OF gpa ON students
FOR EACH ROW
EXECUTE FUNCTION fn_log_gpa_change();

-- Demo update (triggers the log):
-- UPDATE students SET gpa = 3.9 WHERE roll_number = 'RA2301001CS001';
-- SELECT * FROM gpa_audit_log;


-- ------------------------------------------------------------
-- 3.3.4  TRIGGER — prevent_grade_score_decrease
--         Business rule: exam scores cannot be lowered once set
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_prevent_score_decrease()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.score < OLD.score THEN
        RAISE EXCEPTION
            'Score cannot be decreased. Current: %, Attempted: %',
            OLD.score, NEW.score;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_score_decrease ON grades;
CREATE TRIGGER trg_prevent_score_decrease
BEFORE UPDATE OF score ON grades
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_score_decrease();


-- ------------------------------------------------------------
-- 3.3.5  CURSOR — Iterate all students in a department and
--         print their name + GPA category
-- ------------------------------------------------------------
DO $$
DECLARE
    cur_students CURSOR FOR
        SELECT s.name, s.gpa, d.name AS dept
        FROM   students    s
        JOIN   departments d ON s.department_id = d.id
        ORDER  BY d.name, s.gpa DESC;

    rec         RECORD;
    v_category  TEXT;
BEGIN
    OPEN cur_students;

    LOOP
        FETCH cur_students INTO rec;
        EXIT WHEN NOT FOUND;

        v_category := CASE
            WHEN rec.gpa >= 3.7 THEN 'Distinction'
            WHEN rec.gpa >= 3.3 THEN 'First Class'
            WHEN rec.gpa >= 3.0 THEN 'Second Class'
            WHEN rec.gpa >= 2.0 THEN 'Pass'
            ELSE 'Fail'
        END;

        RAISE NOTICE 'Dept: % | Student: % | GPA: % | Category: %',
            rec.dept, rec.name, rec.gpa, v_category;
    END LOOP;

    CLOSE cur_students;
END;
$$;


-- ------------------------------------------------------------
-- 3.3.6  CURSOR — Calculate total credits enrolled per student
--         and flag those below 12 credits as "Under-loaded"
-- ------------------------------------------------------------
DO $$
DECLARE
    cur_enrollment CURSOR FOR
        SELECT
            s.id,
            s.name,
            s.roll_number,
            SUM(c.credits) AS total_credits
        FROM   students    s
        JOIN   enrollments e ON e.student_id = s.id
        JOIN   courses     c ON e.course_id  = c.id
        GROUP  BY s.id, s.name, s.roll_number;

    rec RECORD;
BEGIN
    OPEN cur_enrollment;

    LOOP
        FETCH cur_enrollment INTO rec;
        EXIT WHEN NOT FOUND;

        IF rec.total_credits < 12 THEN
            RAISE NOTICE '[UNDER-LOADED] % (%) — Credits: %',
                rec.name, rec.roll_number, rec.total_credits;
        ELSE
            RAISE NOTICE '[OK] % (%) — Credits: %',
                rec.name, rec.roll_number, rec.total_credits;
        END IF;
    END LOOP;

    CLOSE cur_enrollment;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cursor error: %', SQLERRM;
END;
$$;


-- ------------------------------------------------------------
-- 3.3.7  EXCEPTION HANDLING — Safe student lookup with custom
--         error messages
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION safe_get_student(p_roll VARCHAR)
RETURNS TABLE(
    student_name    TEXT,
    department      TEXT,
    gpa             NUMERIC,
    placement       TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT
            s.name::TEXT,
            d.name::TEXT,
            s.gpa::NUMERIC,
            COALESCE(p.company_name, 'Not Placed')::TEXT
        FROM   students    s
        JOIN   departments d  ON s.department_id = d.id
        LEFT JOIN placements p ON p.student_id   = s.id
        WHERE  s.roll_number = p_roll;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING
            ERRCODE = 'P0002',
            MESSAGE = 'Student not found: ' || p_roll,
            HINT    = 'Check roll number format: RA23XXXXXCSYYY';
    END IF;

EXCEPTION
    WHEN SQLSTATE 'P0002' THEN
        RAISE NOTICE 'Lookup failed — %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error [%]: %', SQLSTATE, SQLERRM;
END;
$$;

-- Usage:
-- SELECT * FROM safe_get_student('RA2301001CS001');
-- SELECT * FROM safe_get_student('INVALID999');    -- triggers exception


-- ------------------------------------------------------------
-- 3.3.8  FUNCTION + EXCEPTION — Enroll student safely,
--         handling duplicate enrollment and missing FK errors
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION enroll_student_safe(
    p_roll      VARCHAR,
    p_course_code VARCHAR
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_student_id    INTEGER;
    v_course_id     INTEGER;
BEGIN
    -- Resolve student
    SELECT id INTO STRICT v_student_id
    FROM   students WHERE roll_number = p_roll;

    -- Resolve course
    SELECT id INTO STRICT v_course_id
    FROM   courses WHERE course_code = p_course_code;

    -- Attempt enrollment
    INSERT INTO enrollments(student_id, course_id)
    VALUES (v_student_id, v_course_id);

    RETURN 'Enrolled successfully';

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'Error: Student or course not found';
    WHEN TOO_MANY_ROWS THEN
        RETURN 'Error: Ambiguous lookup — multiple records found';
    WHEN unique_violation THEN
        RETURN 'Error: Student already enrolled in this course';
    WHEN foreign_key_violation THEN
        RETURN 'Error: Invalid student or course reference';
    WHEN OTHERS THEN
        RAISE NOTICE 'Unhandled error [%]: %', SQLSTATE, SQLERRM;
        RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Usage:
-- SELECT enroll_student_safe('RA2301001CS001', 'CS201');
-- SELECT enroll_student_safe('RA2301001CS001', 'CS201');  -- duplicate → handled


-- ============================================================
-- END OF REVIEW 2 QUERIES
-- ============================================================
