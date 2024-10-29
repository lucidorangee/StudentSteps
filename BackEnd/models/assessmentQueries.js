const getAssessments = "SELECT * FROM assessments";
const getAssessmentById = "SELECT * FROM assessments WHERE assessment_id = $1";
const addAssessment = "INSERT INTO assessments (title, description,date, student_id, subject, notes) VALUES ($1, $2, $3, $4, $5, $6);";
const removeAssessment = "DELETE FROM assessments WHERE assessment_id = $1";
const removeAssessmentByStudentId = "DELETE FROM assessments WHERE student_id = $1";
const removeAssessmentByTutorId = "DELETE FROM assessments WHERE tutor_id = $1";
const updateAssessment = "UPDATE assessments SET date = $2, notes = $3 WHERE assessment_id = $1";

module.exports = {
    getAssessments,
    getAssessmentById,
    addAssessment,
    removeAssessment,
    removeAssessmentByStudentId,
    removeAssessmentByTutorId,
    updateAssessment
}