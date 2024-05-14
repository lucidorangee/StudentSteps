const express = require("express");
const studentRoutes = require('./routes/studentRoutes.js')
const userRoutes = require('./routes/userRoutes.js')
const cors = require('cors');
const initializePassport = require("./passportconfig");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const pool = require("./db.js");

initializePassport(passport);
//app.use(cors())
app.use(cors({ 
    origin: 'http://localhost:3000', 
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(
    session({
      // Key we want to keep secret which will encrypt all of our information
      secret: process.env.SESSION_SECRET,
      // Should we resave our session variables if nothing has changes which we dont
      resave: false,
      // Save empty value if there is no vaue which we do not want to do
      saveUninitialized: false
    })
  );

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.get("/", (req, res) => {
    res.render()
});

app.get("/posts", (req, res) => {
    // Send the posts array as a JSON response
    res.status(200).json(posts);
});

app.get('/posts/:id', (req, res) => {
    const id = req.params.id;
    const post = posts.find((p) => p.id == id);

    if(post){
        res.json(post);
    } else {
        res.status(404).send('Post not found');
    }
})

app.listen(4000, () => console.log("Server is listening to port 4000"));

function createPost(id, title, content, author){
    return{
        id: id,
        title: title,
        content: content,
        author: author,
    };
}



const posts = [ 
    createPost(1, 'Hello World', 'This is my first blog post', 'Alice'),
    createPost(2, 'Test 2', 'Second Post!', 'Bob'),
    createPost(3, 'Hmm', 'idek what to write', 'Charlie'),
];

app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/auth', userRoutes);