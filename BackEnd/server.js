const express = require("express");
const studentRoutes = require('./routes/routes.js')

const app = express();

app.use(express.json());

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
 
app.listen(3000, () => console.log("Server is listening to port 3000"));

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
