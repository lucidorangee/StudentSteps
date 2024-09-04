const getTutors = "SELECT * FROM tutors";
const getTutorById = "SELECT * FROM tutors WHERE tutor_id = $1";
const checkEmailExists = "SELECT t FROM tutors t WHERE t.email = $1";
const addTutor = "INSERT INTO tutors (first_name, last_name, tutor_photo, date_of_birth, contact_phone, contact_email, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)";
const removeTutor = "DELETE FROM tutors WHERE tutor_id = $1";
const updateTutor = "UPDATE tutors SET first_name = $1, last_name = $2, tutor_photo = $3, date_of_birth = $4, contact_phone = $5, contact_email = $6 WHERE tutor_id = $7";

module.exports = {
    getTutors,
    getTutorById,
    checkEmailExists,
    addTutor,
    removeTutor,
    updateTutor,
}