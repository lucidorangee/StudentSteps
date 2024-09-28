const pool = require('../db.js');
const queries = require("../models/commentQueries.js");
const tutoringSessionQueries = require("../models/tutoringSessionQueries.js");


const getComments = (req, res) => {    
    //No approval? Get out
    if(!req.user){
        res.status(200).json({ message: "There is not sufficient permissions to access." });
    }

    const { comment_id, student_id, tutor_id, datetime, type, approved } = req.query;
    console.log('getting comments');
    console.log(student_id);

    // comment_id | student_id | tutor_id | datetime | content | type | stamps | approved

    let baseQuery = queries.getComments;
    let conditions = [];
    let values = [];
    let index = 1;

    if(comment_id){
        conditions.push(`comment_id = $${index++}`);
        values.push(parseInt(comment_id));
    }

    if(student_id){
        conditions.push(`student_id = $${index++}`);
        values.push(parseInt(student_id));
    }
    if(tutor_id){
        conditions.push(`tutor_id = $${index++}`);
        values.push(parseInt(tutor_id));
    }
    else{
        pool.query(`SELECT all_calendar_read FROM roles WHERE name='${req.user.role}'`, (error, results) => {
            if(error) throw error;
            if (results.rows.length > 0) {
                const allCalendarRead = results.rows[0].all_calendar_read;
                
                // Check for all_calendar_read permission, if not, find the student or tutor id
                if (allCalendarRead !== true) {
                    // First search for tutor
                    pool.query(`SELECT tutor_id FROM tutors WHERE user_id='${req.user.id}'`, (error, results) => {
                        if(error) throw error;
                        if(results.rowCount.length > 0){
                            conditions.push(`tutor_id = $${index++}`);
                            values.push(parseInt(results.rows[0].tutor_id));
                        }
                    });
                }
            }
        });
    }

    if(datetime){
        if (/^\d{4}-\d{2}-\d{2}$/.test(datetime)) {
            // Date-only string
            conditions.push(`datetime::date = $${conditions.length + 1}`);
            values.push(datetime);
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(date)) {
            // Full ISO 8601 datetime string
            conditions.push(`datetime = $${conditions.length + 1}`);
            values.push(new Date(datetime));
        } else {
            return res.status(400).send('Invalid datetime format');
        }
    }

    if(type){
        conditions.push(`duration = $${index++}`);
        values.push(parseInt(duration));
    }   
    
    if(approved){
        conditions.push(`approved = $${index++}`);
        values.push(approved);
    }    
    
    if (conditions.length > 0) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    pool.query(baseQuery, values, async (error, results) => {
        if(error) throw error;

        // Assuming results.rows is an array of session objects
        const comments = results.rows;

        // Use Promise.all to fetch student and tutor names concurrently for all sessions
        const commentsWithNames = await Promise.all(comments.map(async (comment) => {
            const studentQuery = 'SELECT first_name, last_name FROM students WHERE student_id = $1';
            const tutorQuery = 'SELECT first_name, last_name FROM tutors WHERE tutor_id = $1';

            const [studentResult, tutorResult] = await Promise.all([
                pool.query(studentQuery, [comment.student_id]),
                pool.query(tutorQuery, [comment.tutor_id])
            ]);

            const studentName = studentResult.rows[0] ? studentResult.rows[0].first_name + ' ' + studentResult.rows[0].last_name : null;
            const tutorName = tutorResult.rows[0] ? tutorResult.rows[0].first_name + ' ' + tutorResult.rows[0].last_name : null;

            return {
                ...comment,
                student_id: studentName,
                tutor_id: tutorName
            };
        }));

        //Return result
        res.status(200).json(commentsWithNames);     
        
        //res.status(200).json(results.rows)
    })
};

const getCommentById = (req, res) => {
    pool.query(queries.getCommentsById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

const addComment = (req, res) => {
    const { student_id, tutor_id, datetime, content, type, stamps, approved } = req.body;

    pool.query(
        queries.addComment,
        [ student_id, tutor_id, datetime, content, type, stamps, approved ],
        (error, results) => {
            if(error) throw error;
            res.status(201).send("Comment has been created successfully");
        }
    )
};

const completeAndAddComment = (req, res) => {
    console.log(req);
    pool.query(
        tutoringSessionQueries.completeTutoringSession,
        [ req.params.id ],
        (error, results) => {
            if(error) throw error;
        }
    )

    const { student_id, tutor_id, datetime, content, type, stamps, approved } = req.body;
    pool.query(
        queries.addComment,
        [ student_id, tutor_id, datetime, content, type, stamps, approved ],
        (error, results) => {
            if(error) throw error;
        }
    )
    
    res.status(201).send("Comment has been created successfully");
}

const removeComment = (req, res) => {
    const id = parseInt(req.params.id);
    
    pool.query(queries.getCommentById, [id], (error, results) => {
        const noCommentFound = !results.rows.length;
        if(noCommentFound){
            res.send("The comment does not exist in the database, could not remove");
        }

        else{
            pool.query(queries.removeComment, [id], (error, result) => {
                if (error) throw error;
                res.status(200).json({'message':"comment "+id+" removed successfully"});
            })
        }
    });
    
}

module.exports = {
    getComments,
    getCommentById,
    addComment,
    removeComment,
    completeAndAddComment,
};