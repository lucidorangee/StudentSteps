const pool = require('../db.js');
const queries = require("../models/queries.js");

const getStudents = (req, res) => {
    console.log('getting students');
    pool.query("SELECT * FROM students", (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);            
    })
};

const getStudentById = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getStudentById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

const addStudent = (req, res) => {
    console.log(req.body);
    const { name, email, age, dob } = req.body;

    pool.query(queries.checkEmailExists, [email], (error, results) => {

        if(results.rows.length){
            res.send("An account under the email already exists");
        }

        //If the email doesn't exist
        pool.query(
            queries.addStudent, 
            [name, email, age, dob], 
            (error, results) => {
                if(error) throw error;
                res.status(201).send("Student has been created successfully");
            }
        )
    });
};

const removeStudent = (req, res) => {
    const id = parseInt(req.params.id);
    
    
    pool.query(queries.getStudentById, [id], (error, results) => {
        const noStudentFound = !results.rows.length;
        if(noStudentFound){
            res.send("Student does not exist in the database, could not remove");
        }

        else{
            pool.query(queries.removeStudent, [id], (error, result) => {
                if (error) throw error;
                res.status(200).send("Student "+id+" removed successfully");
            })
        }
    });

}

const updateStudent = (req, res) => {
    const id = parseInt(req.params.id);
    const {name} = req.body;

    pool.query(queries.getStudentById, [id], (error, results) => {
        const noStudentFound = !results.rows.length;
        if(noStudentFound){
            res.send("Student does not exist in the database.");
        }
        else{
            pool.query(queries.updateStudent, [name, id], (error, results) => {
                if(error) throw error;
                res.status(200).send("Student " + id + " has been successfully updated");
            });
        }
    });
};



module.exports = {
    getStudents,
    getStudentById,
    addStudent,
    removeStudent,
    updateStudent
};