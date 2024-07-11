const express = require("express");
const cors = require('cors');
const initializePassport = require("./passportConfig");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require('path');
require("dotenv").config();
const app = express();
const pool = require("./db.js");

const commentRoutes = require('./routes/commentRoutes.js');
const assessmentRoutes = require('./routes/assessmentRoutes.js');
const tutorRoutes = require('./routes/tutorRoutes.js');
const studentRoutes = require('./routes/studentRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const roleRoutes = require('./routes/roleRoutes.js');
const tutoringSessionRoutes = require('./routes/tutoringSessionRoutes.js');

console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
initializePassport(passport);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// API routes
function authMiddleware(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

// For Public
app.use('/api/v1/auth', userRoutes);

// Login Required (, authMiddleware in the middle)
app.use('/api/v1/comments', authMiddleware, commentRoutes);
app.use('/api/v1/assessments', authMiddleware, assessmentRoutes);
app.use('/api/v1/students', authMiddleware, studentRoutes);
app.use('/api/v1/tutors', authMiddleware, tutorRoutes);
app.use('/api/v1/roles', authMiddleware, roleRoutes);
app.use('/api/v1/tutoringsessions', authMiddleware, tutoringSessionRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
