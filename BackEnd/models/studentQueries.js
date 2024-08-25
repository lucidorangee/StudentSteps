const getStudents = "SELECT * FROM students";
const getStudentById = "SELECT * FROM students WHERE student_id = $1";
const checkEmailExists = "SELECT s FROM students s WHERE s.email = $1";
const addStudent = "INSERT INTO students (first_name, last_name, student_photo, date_of_birth, grade_level, student_phone, student_email, emergency_name, emergency_relationship, emergency_phone, emergency_email, user_id, school, caregiver, secondary_phone, work_phone, address, postalcode, signed, marketing_agreement, can_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)";
const removeStudent = "DELETE FROM students WHERE student_id = $1";
const updateStudent = "UPDATE students SET first_name = $1, last_name = $2, student_photo = $3, date_of_birth = $4, grade_level = $5, student_phone = $6, student_email = $7, emergency_name = $8, emergency_relationship = $9, emergency_phone = $10, emergency_email = $11, school = $12, caregiver = $13, secondary_phone = $14, work_phone = $15, address = $16, postalcode = $17, signed = $18, marketing_agreement = $19, can_email = $20, academic_goal = $21, behavioural_goal = $22 WHERE student_id = $23";

module.exports = {
    getStudents,
    getStudentById,
    checkEmailExists,
    addStudent,
    removeStudent,
    updateStudent,
}