const pool = require('../db.js');
const queries = require("../models/tutoringSessionDraftQueries.js");
const tutoringSessionQueries = require("../models/tutoringSessionQueries.js");

const getTutoringSessionDrafts = (req, res) => {
    pool.query(queries.getTutoringSessionDrafts, (error, results) => {
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

const addTutoringSessionDraft = async (req, res) => {
    const client = await pool.connect();  // Connect to the client for transaction
    const session_id = parseInt(req.params.id);
    console.log(req.body);
    const { tutor_id, student_id, datetime, stamps, comments, prev_homework, new_homework, new_assessments } = req.body;

    try {
        await client.query('BEGIN'); // Start transaction

        await client.query(
            queries.addTutoringSessionDraft,
            [ session_id, tutor_id, student_id, datetime, stamps, comments, prev_homework, new_homework, new_assessments ]
        );

        // Complete tutoring session
        await client.query(tutoringSessionQueries.completeTutoringSession, [session_id]);
        
        await client.query('COMMIT');  // Commit transaction
        res.status(201).send("Tutoring session draft added successfully");

    } catch (error) {
        await client.query('ROLLBACK'); // Rollback if any error occurs
        console.error("Transaction failed:", error);
        res.status(500).send("Error completing tutoring session and adding comment");
    } finally {
        client.release();  // Release the client back to the pool
    }
};

const removeTutoringSessionDraft = async (req, res) => {
    console.log("removeTutoringSessionDraft");
    console.log(req);
    const id = parseInt(req.params.id);
    const { session_id } = req.body;
    const client = await pool.connect();  // Connect to the client for transaction

    try {
        await client.query('BEGIN'); // Start transaction

        // remove draft
        await client.query(
            queries.removeTutoringSessionDraft,
            [ id ]
        );

        // Complete tutoring session
        await client.query(tutoringSessionQueries.rollbackTutoringSession, [session_id]);

        
        await client.query('COMMIT');  // Commit transaction
        res.status(201).send("Tutoring session draft successfully removed");

    } catch (error) {
        await client.query('ROLLBACK'); // Rollback if any error occurs
        console.error("Transaction failed:", error);
        res.status(500).send("Error completing tutoring session and adding comment");
    } finally {
        client.release();  // Release the client back to the pool
    }
}

module.exports = {
    getTutoringSessionDrafts,
    addTutoringSessionDraft,
    getTutoringSessionDraftById,
    removeTutoringSessionDraft
};