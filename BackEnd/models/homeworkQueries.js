const getHomework = "SELECT * FROM homework";
const getHomeworkById = "SELECT * FROM homework WHERE homework_id = $1";
const addHomework = "INSERT INTO homework (student_id, assigned, due_date, is_completed, subject, notes) VALUES ($1, $2, $3, $4, $5, $6)";
const removeHomework = "DELETE FROM homework WHERE homework_id = $1";
const updateHomework = "UPDATE homework SET studnet_id = $1, assigned = $2, due_date = $3, is_completed = $4, subject = $5, notes = $6 WHERE homework_id = $7";

module.exports = {
    getHomework,
    getHomeworkById,
    addHomework,
    removeHomework,
    updateHomework,
}