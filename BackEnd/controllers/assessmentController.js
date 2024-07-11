const pool = require('../db.js');
const queries = require("../models/assessmentQueries.js");

const getAssessments = (req, res) => {
    pool.query(queries.getAssessments, (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);            
    })
};

const getAssessmentById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(queries.getAssessmentByName, [id], (error, results) => {
      if(error) throw error;
      res.status(200).json(results.rows);
  });
};

const addAssessment = async (req, res) => {
    const { title, description,date, student_id, subject, notes } = req.body;

    try {
      await pool.query(
          queries.addAssessment,
          [ title, description,date, student_id, subject, notes ]
      );
        res.status(201).send('Assessment added successfully');
      } catch (error) {
        console.error('Error adding assessment:', error);
        res.status(500).send('Internal server error');
      }
  
    
  };


const removeAssessment = (req, res) => {
  const id = parseInt(req.params.id);
  
  pool.query(queries.getAssessmentById, [id], (error, results) => {
      if (error) throw error;
      const noAssessmentFound = !results.rows.length;
      if(noAssessmentFound){
          res.send("The assessment does not exist in the database, could not remove");
      }

      else{
          pool.query(queries.removeAssessment, [id], (error, result) => {
              if (error) throw error;
              res.status(200).send("Assessment with ID "+id+" removed successfully");
          })
      }
  });

}

const updateAssessment = async (req, res) => {
    const roles = req.body;
    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        for(const role of roles)
        {
            if(role.name === 'admin') continue;
            const { title, description,date, student_id, subject, notes } = role;
            await client.query(queries.updateRole, 
                [ title, description,date, student_id, subject, notes ]
            );
        }

        await client.query('COMMIT');
        res.status(200).send('Assessments updated successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating assessments:', error);
        res.status(500).send('Internal server error');
    } finally {
        client.release();
    }
    
};



module.exports = {
    getAssessments,
    getAssessmentById,
    addAssessment,
    removeAssessment,
    updateAssessment
};