const pool = require('../db.js');
const queries = require("../models/tutoringSessionQueries.js");

const getTutoringSessions = (req, res) => {
    const { student_id, tutor_id, datetime, duration } = req.query;
    console.log('getting sessions');

    let baseQuery = queries.getTutoringSessions;
    let conditions = [];
    let values = [];
    let index = 1;


    // If no all_calendar_read permission, find the user's student or tutor id and filter
    pool.query(`SELECT all_calendar_read FROM roles WHERE name='${req.user.role}'`, (error, results) => {
        if(error) throw error;
        if (results.rows.length > 0) {
            const allCalendarRead = results.rows[0].all_calendar_read;
            
            if (allCalendarRead !== true) {
                // First search for tutor
                pool.query(`SELECT tutor_id FROM tutors WHERE user_id='${req.user.id}'`, (error, results) => {
                    if(error) throw error;
                    if(results.rowCount.length > 0){
                        conditions.push(`tutor_id = $${index++}`);
                        values.push(parseInt(results.rows[0].tutor_id));
                    }
                });

                pool.query(`SELECT student_id FROM students WHERE user_id='${req.user.id}'`, (error, results) => {
                    if(error) throw error;
                    if(results.rowCount.length > 0){
                        conditions.push(`student_id = $${index++}`);
                        values.push(parseInt(results.rows[0].tutor_id));
                    }
                });
            }
        } else {
            console.log('No results found for role:', req.user.role);
        }
    });

    if(student_id){
        conditions.push(`student_id = $${index++}`);
        values.push(parseInt(student_id));
    }
    if(tutor_id){
        conditions.push(`tutor_id = $${index++}`);
        values.push(parseInt(tutor_id));
    }
    
    if(datetime){
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            // Date-only string
            conditions.push(`session_datetime::date = $${conditions.length + 1}`);
            values.push(date); // PostgreSQL can compare date strings directly
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(date)) {
            // Full ISO 8601 datetime string
            conditions.push(`session_datetime = $${conditions.length + 1}`);
            values.push(new Date(date));
        } else {
            return res.status(400).send('Invalid date format');
        }
    }

    if(duration){
        conditions.push(`duration = $${index++}`);
        values.push(parseInt(duration));
    }    
    
    if (conditions.length > 0) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    pool.query(baseQuery, values, async (error, results) => {
        if(error) throw error;
        const sessions = results.rows;

        // Use Promise.all to fetch student and tutor names concurrently for all sessions
        const sessionsWithNames = await Promise.all(sessions.map(async (session) => {
            const studentQuery = 'SELECT first_name, last_name FROM students WHERE student_id = $1';
            const tutorQuery = 'SELECT first_name, last_name FROM tutors WHERE tutor_id = $1';

            const [studentResult, tutorResult] = await Promise.all([
                pool.query(studentQuery, [session.student_id]),
                pool.query(tutorQuery, [session.tutor_id])
            ]);

            const studentName = studentResult.rows[0] ? studentResult.rows[0].first_name + ' ' + studentResult.rows[0].last_name : null;
            const tutorName = tutorResult.rows[0] ? tutorResult.rows[0].first_name + ' ' + tutorResult.rows[0].last_name : null;

            return {
                ...session,
                student_name: studentName,
                tutor_name: tutorName
            };
        }));

        //Return result
        res.status(200).json(sessionsWithNames);
    })
};

const getTutoringSessionById = (req, res) => {
    pool.query(queries.getTutoringSessionById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

const addTutoringSession = (req, res) => {
    console.log(req.body);
    const { student_id, tutor_id, date, duration, notes } = req.body;

    // Search the student_id via student_name

    // Search the tutor_id via tutor_name

    pool.query(
        queries.addTutoringSession,
        [ student_id, tutor_id, date.replace("T", " ").replace("Z", "+00:00"), duration, notes ],
        (error, results) => {
            if(error) throw error;
            res.status(201).send("Session has been created successfully");
        }
    )
};

const removeTutoringSession = (req, res) => {
    const id = parseInt(req.params.id);
    
    
    pool.query(queries.getTutoringSessionById, [id], (error, results) => {
        const noSessionFound = !results.rows.length;
        if(noSessionFound){
            res.send("The session does not exist in the database, could not remove");
        }

        else{
            pool.query(queries.removeTutoringSession, [id], (error, result) => {
                if (error) throw error;
                res.status(200).send("Session "+id+" removed successfully");
            })
        }
    });

}

const submitTutoringSession = (req, res) => {
    const id = parseInt(req.params.session_id);
    
    pool.query(queries.TutoringSessionById, [id], (error, results) => {
        if(!results.rows.length){
            res.send("The session does not exist in the database, could not update complete column");
        }

        else{
            pool.query(queries.completeTutoringSession, [id], (error, result) => {
                if (error) throw error;
                res.status(200).send("Session "+id+" updated successfully");
            })
        }
    });

}

module.exports = {
    getTutoringSessions,
    getTutoringSessionById,
    addTutoringSession,
    removeTutoringSession,
    submitTutoringSession,
};