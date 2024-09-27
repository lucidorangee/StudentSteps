const pool = require('../db.js');
const queries = require("../models/studentQueries.js");
const bcrypt = require("bcrypt");

const getStudents = (req, res) => {
    pool.query("SELECT * FROM students", (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);            
    })
};

const getStudentById = (req, res) => {
  console.log("hi");
    const id = parseInt(req.params.id);
    pool.query(queries.getStudentById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};
// student_id | first_name | last_name | student_photo | date_of_birth | grade_level | student_phone | 
// student_email | emergency_name | emergency_relationship | emergency_phone | emergency_email | user_id | 
// stamps | school | caregiver | secondary_phone | work_phone | address | postalcode | signed | marketing_agreement | can_email
const addStudent = async (req, res) => {
  const { first_name, last_name, student_photo, date_of_birth, grade_level, student_phone, 
      student_email, emergency_name, emergency_relationship, emergency_phone, emergency_email,  
      school, caregiver, secondary_phone, work_phone, address, postalcode, signed, marketing_agreement, can_email } = req.body;

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

  // Add user
  try {
    const hashedPassword = await bcrypt.hash('temp', 10);
    const userResult = await pool.query(
        `INSERT INTO users (name, username, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [`${first_name} ${last_name}`, username, hashedPassword, 'student']
    );

    // Add student
    const user_id = userResult.rows[0].id;

    const result = await pool.query(
        queries.addStudent,
        [first_name, last_name, student_photo, date_of_birth, grade_level, student_phone, 
            student_email, emergency_name, emergency_relationship, emergency_phone, emergency_email, user_id, 
            school, caregiver, secondary_phone, work_phone, address, postalcode, signed, marketing_agreement, can_email]
    );
    const student_id = result.rows[0].student_id;
    res.status(201).json({ message: 'Student added successfully', student_id });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).send('Internal server error');
  }
};



const addStudentbefore = async (req, res) => {
    const {
      first_name, last_name, student_photo, date_of_birth, grade_level, student_phone, 
      student_email, emergency_name, emergency_relationship, emergency_phone, emergency_email,  
      school, caregiver, secondary_phone, work_phone, address, postalcode, signed, marketing_agreement, can_email
    } = req.body;
    
    console.log("ADDING...");
  
    let index = 1;
    let complete = false;
    let username;
  
    // Loop to ensure unique username
    while (!complete) {
      console.log(index);
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
  
    try {
      console.log(username);
      const hashedPassword = await bcrypt.hash('temp', 10);
  
      // Insert new user into users table
      const userResult = await pool.query(
        `INSERT INTO users (name, username, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [`${first_name} ${last_name}`, username, hashedPassword, 'student']
      );
  
      const user_id = userResult.rows[0].id;
  
      // Insert new student details into students table
      await pool.query(
        queries.addStudent,
        [
          first_name, last_name, student_photo, date_of_birth, grade_level, student_phone, 
          student_email, emergency_name, emergency_relationship, emergency_phone, emergency_email, user_id, 
          school, caregiver, secondary_phone, work_phone, address, postalcode, signed, marketing_agreement, can_email
        ]
      );
  
      res.status(201).send('Student added successfully');
    } catch (error) {
      // Log and send appropriate error message
      if (error.code === '23505') {
        res.status(409).send('Username already exists');
      } else {
        console.error('Error adding student:', error);
        res.status(500).send('Internal server error');
      }
    }
  };

const removeStudent = (req, res) => {
    const id = parseInt(req.params.id);
    
    pool.query(queries.getStudentById, [id], (error, results) => {
        if (error) throw error;
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

const updateStudent = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const {
    first_name, last_name, student_photo, date_of_birth, grade_level, student_phone, 
    student_email, emergency_name, emergency_relationship, emergency_phone, emergency_email,  
    school, caregiver, secondary_phone, work_phone, address, postalcode, signed, marketing_agreement, can_email, academic_goal, behavioural_goal
  } = req.body;

  try {
    await pool.query(
      queries.updateStudent,
      [
        first_name, last_name, student_photo, date_of_birth, grade_level, student_phone, 
        student_email, emergency_name, emergency_relationship, emergency_phone, emergency_email, 
        school, caregiver, secondary_phone, work_phone, address, postalcode, signed, 
        marketing_agreement, can_email, academic_goal, behavioural_goal, id
      ]
    );

    res.status(200).send('Student updated successfully');
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send('Internal server error');
  }
};



module.exports = {
    getStudents,
    getStudentById,
    addStudent,
    removeStudent,
    updateStudent
};