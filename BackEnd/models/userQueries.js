const getUsers = "SELECT * FROM users";
const removeUser = "DELETE FROM users WHERE id = $1";
const getUserById = "SELECT * FROM users WHERE id = $1";

module.exports = {
    getUsers,
    removeUser,
    getUserById
}