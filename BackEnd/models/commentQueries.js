const getComments = "SELECT * FROM comments";
const getCommentById = "SELECT * FROM comments WHERE comment_id = $1";
const addComment = "INSERT INTO comments (student_id, tutor_id, datetime, content, type, stamps, approved) VALUES ($1, $2, $3, $4, $5, $6, $7)";
const removeComment = "DELETE FROM comments WHERE comment_id = $1";

module.exports = {
    getComments,
    getCommentById,
    addComment,
    removeComment,
}