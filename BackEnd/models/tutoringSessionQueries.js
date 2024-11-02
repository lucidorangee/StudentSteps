const getTutoringSessions = "SELECT * FROM tutoring_session";
const getTutoringSessionById = "SELECT * FROM tutoring_session WHERE session_id = $1";
const addTutoringSession = "INSERT INTO tutoring_session (student_id, tutor_id, session_datetime, duration, notes) VALUES ($1, $2, $3, $4, $5)";
const removeTutoringSessionById = "DELETE FROM tutoring_session WHERE session_id = $1";
const removeTutoringSessionByStudentId = "DELETE FROM tutoring_session WHERE student_id = $1 AND complete = false";
const removeTutoringSessionByTutorId = "DELETE FROM tutoring_session WHERE tutor_id = $1 AND complete = false";
const removeTutoringSessionsBetweenDates = "DELETE FROM tutoring_sessions WHERE student_id = $1 AND session_datetime BETWEEN $2 AND $3";
const completeTutoringSession = "UPDATE tutoring_session SET complete = true WHERE session_id = $1";
const rollbackTutoringSession = "UPDATE tutoring_session SET complete = false WHERE session_id = $1";

module.exports = {
    getTutoringSessions,
    getTutoringSessionById,
    addTutoringSession,
    removeTutoringSessionById,
    removeTutoringSessionByStudentId,
    removeTutoringSessionByTutorId,
    removeTutoringSessionsBetweenDates,
    completeTutoringSession,
    rollbackTutoringSession,
}