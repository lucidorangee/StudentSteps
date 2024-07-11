const pool = require('../db.js');
const queries = require("../models/userQueries.js");
const bcrypt = require("bcrypt");

const login = (req, res) => {
    console.log("Log In Success");
    res.status(200).json({ message: "Authentication successful", user: req.user });
}

const getUsers = (req, res) => {
  if(req.user.role !== "admin")
  {
    if(req.user.role == "public") res.status(200).json({ message: "There is not sufficient permissions to access. You're a public." });
    else res.status(200).json({ message: "There is not sufficient permissions to access." });
  }
  pool.query(queries.getUsers, (error, results) => {
    if(error)
    {
      console.log("ERROR " + error);
      throw error;
    }
    res.status(200).json(results.rows);
  });
  
}

const logout = (req, res) => {
  req.logout(); // Passport.js logout function
  res.status(200).json({ message: "Logged out successfully" });
};

/*
app.post(
    "/users/login",
    passport.authenticate("local", {
        successRedirect: "http://localhost:3000/",
        failureRedirect: "http://localhost:3000/login",
        failureFlash: true
    })
);*/

const loginfail = (req, res) => {
    console.log("Log In Failed");
    res.status(401).json({ message: "Authentication failed" });
}

const registerUser = async (req, res) => {
  let { name, username, password, password2 } = req.body;

  let errors = [];

  console.log({
    name,
    username,
    password,
    password2
  });

  if (!name || !username || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "There is an error." });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Validation passed
    pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          res.status(400).json({ message: "This username is already being used" });
        } else {
          pool.query(
            `INSERT INTO users (name, username, password)
                VALUES ($1, $2, $3)
                RETURNING id, password`,
            [name, username, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
};

const checkAuthenticated = (req, res) => {
  if (req.isAuthenticated()) {
    console.log("userController.js: Authenticated");
    res.status(200).json({ message: "Confirmed!", isAuthenticated: true });
  }
  else 
  {
    console.log("userController.js: Unuthenticated");
    res.status(401).json({ message: "Unable to confirm authentication", isAuthenticated: false });
  }
}

/**

const doNothing = (req, res) => {
    console.log("A confirmation message");
    res.status(200).json({ message: "Confirmed!", isAuthenticated: true });
}
const checkAuthenticated = (req, res, next) => {
  console.log("Authenticated: " + req.isAuthenticated());
  if (req.isAuthenticated()) {
    console.log("authenticated");
    next();
  }
  else res.status(401).json({ message: "Unable to confirm authentication", isAuthenticated: false });
}
*/

module.exports = {
    login,
    logout,
    loginfail,
    registerUser,
    checkAuthenticated,
    getUsers
};