const pool = require('../db.js');
const tutorQueries = require("../models/tutorQueries.js");
const bcrypt = require("bcrypt");

const getTutors = (req, res) => {
    pool.query("SELECT * FROM tutors", (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);            
    })
};

const getTutorById = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(tutorQueries.getTutorById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

// tutor_id | first_name | last_name | tutor_photo | date_of_birth | contact_phone | contact_email | user_id
const addTutor = async (req, res) => {
    const { first_name, last_name, photo, date_of_birth, phone, email } = req.body;

    let index = 1;
    let complete = false;
    let username;

    // Check for valid username
    while (!complete) {
        username = `${first_name}${last_name.charAt(0)}${index}`;
        try {
            const results = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
            if (results.rows.length > 0) {
            index++;
            } else {
            complete = true;
            }
        } catch (error) {
            console.error('Error checking username availability:', error);
            res.status(500).send('Internal server error');
            return;
        }
    }

    const hashedPassword = await bcrypt.hash('temp', 10);
    const userResult = await pool.query(
        `INSERT INTO users (name, username, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [`${first_name} ${last_name}`, username, hashedPassword, 'tutor']
    );

    // Add student
    const user_id = userResult.rows[0].id;

    try{
        await pool.query(
            tutorQueries.addTutor, 
            [ first_name, last_name, photo, date_of_birth, phone, email, user_id ]
        );
        res.status(201).send('Tutor added successfully');
    } catch (error) {
        console.error('Error adding tutor:', error);
        res.status(500).send('Internal server error');
    }
};

const removeTutor = (req, res) => {
    const id = parseInt(req.params.id);
    
    
    pool.query(tutorQueries.getTutorById, [id], (error, results) => {
        const noTutorFound = !results.rows.length;
        if(noTutorFound){
            res.send("Tutor does not exist in the database, could not remove");
        }

        else{
            pool.query(tutorQueries.removeTutor, [id], (error, result) => {
                if (error) throw error;
                res.status(200).send("Tutor "+id+" removed successfully");
            })
        }
    });

}

const updateTutor = (req, res) => {
    const id = parseInt(req.params.id);
    const {
        first_name, last_name, tutor_photo, date_of_birth, contact_phone, contact_email
      } = req.body;

    pool.query(tutorQueries.getStudentById, [id], (error, results) => {
        const noStudentFound = !results.rows.length;
        if(noStudentFound){
            res.send("Student does not exist in the database.");
        }
        else{
            pool.query(tutorQueries.updateStudent, [first_name, last_name, tutor_photo, date_of_birth, contact_phone, contact_email, id], (error, results) => {
                if(error) throw error;
                res.status(200).send("Student " + id + " has been successfully updated");
            });
        }
    });
};



module.exports = {
    getTutors,
    getTutorById,
    addTutor,
    removeTutor,
    updateTutor
};