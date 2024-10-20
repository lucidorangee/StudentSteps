const pool = require('../db.js');
const queries = require("../models/tutoringSessionDraftQueries.js");

const getTutoringSessionDrafts = (req, res) => {
    const { datetime } = req.query;

    const values = [datetime]; // Adjust this based on your actual query needs

    pool.query(queries.getTutoringSessionDrafts, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'An error occurred while fetching sessions.' });
        }

        const sessions = results.rows;
        // Return the results
        res.status(200).json(sessions);
    });
};


const getTutoringSessionDraftById = (req, res) => {
    const id = parseInt(req.params.id);

    pool.query(queries.getTutoringSessionDraftById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

const addTutoringSessionDraft = (req, res) => {
    const session_id = parseInt(req.params.id);
    console.log(req.body);
    const { tutor_id, student_id, datetime, stamps, comments, prev_homework, new_homework, new_assessments } = req.body;

    pool.query(
        queries.addTutoringSessionDraft,
        [ session_id, tutor_id, student_id, datetime, stamps, comments, prev_homework, new_homework, new_assessments ],
        (error, results) => {
            if(error) throw error;
            res.status(201).send("Session Draft has been created successfully");
        }
    )
};

const removeTutoringSessionDraft = (req, res) => {
    const id = parseInt(req.params.id);
    
    pool.query(queries.getTutoringSessionDraftById, [id], (error, results) => {
        const noSessionFound = !results.rows.length;
        if(noSessionFound){
            res.send("The session does not exist in the database, could not remove");
        }

        else{
            pool.query(queries.removeTutoringSessionDraft, [id], (error, result) => {
                if (error) throw error;
                res.status(200).send("Session "+id+" removed successfully");
            })
        }
    });
}

module.exports = {
    getTutoringSessionDrafts,
    addTutoringSessionDraft,
    getTutoringSessionDraftById,
    removeTutoringSessionDraft
};