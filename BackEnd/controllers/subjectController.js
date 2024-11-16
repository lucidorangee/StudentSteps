const pool = require('../db.js');
const tutorQueries = require("../models/subjectQueries.js");

const getSubjects = (req, res) => {
    pool.query("SELECT * FROM subjects", (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);            
    })
};

const addSubject = (req, res) => {
    const { subject_name } = req.body;

    if (!subject_name) {
        return res.status(400).json({ error: "Subject name is required." });
    }

    const query = `INSERT INTO subjects (name) VALUES ($1)`;

    pool.query(query, [subject_name], (error) => {
        if (error) {
            console.error("Error adding subject:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(201).json({ message: "Subject added successfully." });
    });
};

const renameSubject = (req, res) => {
    const { old_name, new_name } = req.body;

    // Validate input
    if (!old_name || !new_name) {
        return res.status(400).json({ error: "Both old_name and new_name are required." });
    }

    const query = `UPDATE subjects SET name = $1 WHERE name = $2`;

    pool.query(query, [new_name, old_name], (error, results) => {
        if (error) {
            console.error("Error renaming subject:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.rowCount === 0) {
            return res.status(404).json({ error: "Subject not found." });
        }

        res.status(200).json({ message: "Subject renamed successfully." });
    });
};


const removeSubject = (req, res) => {
    const { subject_name } = req.body;

    if (!subject_name) {
        return res.status(400).json({ error: "Subject name is required." });
    }

    const query = `DELETE FROM subjects WHERE name = $1`;

    pool.query(query, [subject_name], (error, results) => {
        if (error) {
            console.error("Error removing subject:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.rowCount === 0) {
            return res.status(404).json({ error: "Subject not found." });
        }

        res.status(200).json({ message: "Subject removed successfully." });
    });
};

module.exports = {
    getSubjects,
    addSubject,
    removeSubject,
    renameSubject
};