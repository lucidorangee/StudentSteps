const addTutoringSessionDraft = `
  INSERT INTO tutoring_session_drafts (
    session_id, tutor_id, student_id, datetime, stamps, comments, homework_update, homework, assessments, assessments_update
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`;

const getTutoringSessionDrafts = "SELECT * FROM tutoring_session_drafts";
const getTutoringSessionDraftById = "SELECT * FROM tutoring_session_drafts WHERE id = $1";
const removeTutoringSessionDraft = "DELETE FROM tutoring_session_drafts WHERE id = $1";

module.exports = {
    addTutoringSessionDraft,
    getTutoringSessionDrafts,
    getTutoringSessionDraftById,
    removeTutoringSessionDraft, 
}