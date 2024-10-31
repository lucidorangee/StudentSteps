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

const addTutoringSession = async (req, res) => {
    //console.log(req.body);
    const { student_id, tutor_id, dateTimeList, repeatCount, notes } = req.body;
    
    console.log(`Current dateTimeList ${JSON.stringify(dateTimeList)}`);

    if (!Number.isInteger(repeatCount) || repeatCount < 1 || repeatCount > 100) {
        return res.status(400).json({ error: "repeatCount must be an integer between 1 and 100." });
    }

    const client = await pool.connect();  // Connect to the client for transaction

    try {
        await client.query('BEGIN'); // Start transaction

        for (let count = 0; count < repeatCount; count++) {
            const dateTime = dateTimeList[count % dateTimeList.length];


            // Ensure dateTime has the correct format
            const formattedDateTime = dateTime.date.replace("T", " ").replace("Z", "+00:00");

            await client.query(
                queries.addTutoringSession,
                [student_id, tutor_id, formattedDateTime, dateTime.hour * 60 + dateTime.minute, notes]
            );

            sessionDate.setDate(sessionDate.getDate() + 7);
            currentDateTimeList[index].date = sessionDate;
        }

        
        await client.query('COMMIT');  // Commit transaction
        res.status(201).send("Tutoring sessions successfully added");

    } catch (error) {
        await client.query('ROLLBACK'); // Rollback if any error occurs
        console.error("Transaction failed:", error);
        res.status(500).send("Error adding tutoring sessions");
    } finally {
        client.release();  // Release the client back to the pool
    }
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

const editTutoringSession = (req, res) => {
    const session_id = parseInt(req.params.id); // Get session_id from the route params
    const { student_id, tutor_id, date, duration, notes } = req.body;

    let updateFields = [];
    let updateValues = [];
    let queryIndex = 1;

    // Add each property to the query if it's provided in req.body
    if (student_id !== undefined) {
        updateFields.push(`student_id = $${queryIndex++}`);
        updateValues.push(student_id);
    }
    if (tutor_id !== undefined) {
        updateFields.push(`tutor_id = $${queryIndex++}`);
        updateValues.push(tutor_id);
    }
    if (date !== undefined) {
        updateFields.push(`session_datetime = $${queryIndex++}`);
        updateValues.push(date.replace("T", " ").replace("Z", "+00:00")); // Ensure date is formatted correctly
    }
    if (duration !== undefined) {
        updateFields.push(`duration = $${queryIndex++}`);
        updateValues.push(duration);
    }
    if (notes !== undefined) {
        updateFields.push(`notes = $${queryIndex++}`);
        updateValues.push(notes);
    }

    // Ensure we have fields to update
    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    // Add session_id to the update values
    updateValues.push(session_id);

    // Add session_id placeholder at the current queryIndex
    const updateQuery = `
        UPDATE tutoring_session
        SET ${updateFields.join(', ')}
        WHERE session_id = $${queryIndex}
    `;

    // Execute the query
    pool.query(updateQuery, updateValues, (error, results) => {
        if (error) {
            console.error('Error updating tutoring session:', error);
            return res.status(500).json({ error: 'Failed to update tutoring session' });
        }

        res.status(200).json({ message: 'Tutoring session updated successfully' });
    });
};


module.exports = {
    getTutoringSessions,
    getTutoringSessionById,
    addTutoringSession,
    removeTutoringSession,
    submitTutoringSession,
    editTutoringSession,
};