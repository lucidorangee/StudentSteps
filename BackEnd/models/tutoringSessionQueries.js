const getTutoringSessions = "SELECT * FROM tutoring_session";
const getTutoringSessionById = "SELECT * FROM tutoring_session WHERE session_id = $1";
const addTutoringSession = "INSERT INTO tutoring_session (student_id, tutor_id, session_datetime, duration, notes) VALUES ($1, $2, $3, $4, $5)";
const removeTutoringSession = "DELETE FROM tutoring_session WHERE session_id = $1";
const completeTutoringSession = "UPDATE tutoring_session SET complete = true WHERE session_id = $1";

module.exports = {
    getTutoringSessions,
    getTutoringSessionById,
    addTutoringSession,
    removeTutoringSession,
    completeTutoringSession,
}