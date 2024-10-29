const getHomework = "SELECT * FROM homework";
const getHomeworkById = "SELECT * FROM homework WHERE homework_id = $1";
const addHomework = "INSERT INTO homework (student_id, assigned, due_date, is_completed, subject, notes) VALUES ($1, $2, $3, $4, $5, $6)";
const removeHomework = "DELETE FROM homework WHERE homework_id = $1";
const removeHomeworkByStudentId = "DELETE FROM homework WHERE student_id = $1";
const removeHomeworkByTutorId = "DELETE FROM homework WHERE tutor_id = $1";
const updateHomework = "UPDATE homework SET student_id = $1, assigned = $2, due_date = $3, is_completed = $4, subject = $5, notes = $6 WHERE homework_id = $7";
const updateHomeworkCompletion = "UPDATE homework SET is_completed = $2 WHERE homework_id = $1";

module.exports = {
    getHomework,
    getHomeworkById,
    addHomework,
    removeHomework,
    removeHomeworkByStudentId,
    removeHomeworkByTutorId,
    updateHomework,
    updateHomeworkCompletion,
}