const express = require('express');
const blogRouter = express.Router();


//Get one blog
blogRouter.get('/:id', (req, res) => {
    res.json({ message: 'Blog' });
});

//Get all blogs
blogRouter.get('/', (req, res) => {
    res.json({ message: 'Blog' });
});

//Create blog
blogRouter.post('/', (req, res) => {
    res.json({ message: 'Blog' });
});

//update a blog
blogRouter.put('/:id', (req, res) => {
    res.json({ message: 'Blog' });
});

//delete a blog
blogRouter.delete('/:id', (req, res) => {
    res.json({ message: 'Blog' });
});

module.exports = blogRouter;
