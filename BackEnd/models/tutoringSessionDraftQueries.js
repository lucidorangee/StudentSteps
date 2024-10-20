const addTutoringSessionDraft = `
  INSERT INTO tutoring_session_drafts (
    session_id, tutor_id, student_id, datetime, stamps, comments, prev_homework, new_homework, new_assessments
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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