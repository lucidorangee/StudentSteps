const pool = require('../db.js');
const queries = require("../models/homeworkQueries.js");
const bcrypt = require("bcrypt");

const getHomework = (req, res) => {
    pool.query("SELECT * FROM homework", (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);            
    })
};

const getHomeworkById = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getHomeworkById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

const addHomework = (req, res) => {
  const { student_id, assigned, due_date, is_completed, subject, notes } = req.body;

  pool.query(
      queries.addHomework,
      [ student_id, assigned, due_date, is_completed, subject, notes ],
      (error, results) => {
          if(error) throw error;
          res.status(201).send("Homework has been created successfully");
      }
  )
};

const removeHomework = (req, res) => {
    const id = parseInt(req.params.id);
    
    pool.query(queries.getHomeworkById, [id], (error, results) => {
        if (error) throw error;
        const noHomeworkFound = !results.rows.length;
        if(noHomeworkFound){
            res.send("Homework does not exist in the database, could not remove");
        }

        else{
            pool.query(queries.removeHomework, [id], (error, result) => {
                if (error) throw error;
                res.status(200).send("Homework "+id+" removed successfully");
            })
        }
    });

}

const updateHomework = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const {
    student_id, assigned, due_date, is_completed, subject, notes
  } = req.body;

  try {
    await pool.query(
      queries.updateHomework,
      [
        student_id, assigned, due_date, is_completed, subject, notes, id
      ]
    );

    res.status(200).send('Homework updated successfully');
  } catch (error) {
    console.error('Error updating homework:', error);
    res.status(500).send('Internal server error');
  }
};



module.exports = {
    getHomework,
    getHomeworkById,
    addHomework,
    removeHomework,
    updateHomework
};