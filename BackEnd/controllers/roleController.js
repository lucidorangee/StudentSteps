const pool = require('../db.js');
const queries = require("../models/roleQueries.js");

const getRoles = (req, res) => {
    pool.query("SELECT * FROM roles", (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);            
    })
};

const getRoleByName = (req, res) => {
  const name = parseInt(req.params.name);
  pool.query(queries.getRoleByName, [name], (error, results) => {
      if(error) throw error;
      res.status(200).json(results.rows);
  });
};

const addRole = async (req, res) => {
    const { name } = req.body;

    try {
      await pool.query(
          queries.addRole,
          [ name ]
      );
        res.status(201).send('Role added successfully');
      } catch (error) {
        console.error('Error adding role:', error);
        res.status(500).send('Internal server error');
      }
  
    
  };


const removeRole = (req, res) => {
  const name = parseInt(req.params.name);
  
  pool.query(queries.getRoleByName, [name], (error, results) => {
      if (error) throw error;
      const noRoleFound = !results.rows.length;
      if(noRoleFound){
          res.send("Role does not exist in the database, could not remove");
      }

      else{
          pool.query(queries.removeRole, [name], (error, result) => {
              if (error) throw error;
              res.status(200).send("Role "+name+" removed successfully");
          })
      }
  });

}

const updateRole = async (req, res) => {
    const roles = req.body;
    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        for(const role of roles)
        {
            if(role.name === 'admin') continue;
            const { name, perm_read, perm_write, perm_delete, comments_read, comments_write, comments_edit, all_calendar_read, all_calendar_write, all_calendar_edit, self_calendar_read, self_calendar_write, self_calendar_edit } = role;
            await client.query(queries.updateRole, 
                [name, perm_read, perm_write, perm_delete, comments_read, comments_write, comments_edit, all_calendar_read, all_calendar_write, all_calendar_edit, self_calendar_read, self_calendar_write, self_calendar_edit]
            );
        }

        await client.query('COMMIT');
        res.status(200).send('Roles updated successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating roles:', error);
        res.status(500).send('Internal server error');
    } finally {
        client.release();
    }
    
};



module.exports = {
    getRoles,
    getRoleByName,
    addRole,
    removeRole,
    updateRole
};