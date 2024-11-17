const pool = require('../db.js');
const queries = require("../models/assessmentQueries.js");

const getAssessments = (req, res) => {
    pool.query(queries.getAssessments, (error, results) => {
        if(error) throw error;
        console.log(results.rows);
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
    const { title, description,date, student_id, subject, notes, outcome } = req.body;

    try {
        await pool.query(
            queries.addAssessment,
            [ title, description,date, student_id, subject, notes, outcome ]
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

module.exports = {
    getAssessments,
    getAssessmentById,
    addAssessment,
    removeAssessment
};