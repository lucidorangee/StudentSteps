const getRoles = "SELECT * FROM roles";
const getRoleByName = "SELECT * FROM roles WHERE name = $1";
const addRole = "INSERT INTO roles (name) VALUES ($1)";
const removeRole = "DELETE FROM roles WHERE role_id = $1";
const updateRole = `UPDATE roles SET perm_read = $2, perm_write = $3, perm_delete = $4, comments_read = $5, comments_write = $6, comments_edit = $7, all_calendar_read = $8, all_calendar_write = $9, all_calendar_edit = $10, self_calendar_read = $11, self_calendar_write = $12, self_calendar_edit = $13 WHERE name = $1`;

module.exports = {
 getRoles,
 getRoleByName,
 addRole,
 removeRole,
 updateRole,
}