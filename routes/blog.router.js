const express = require('express');
const blogRouter = express.Router();
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middlewares/auth.middleware');

//Get one blog
blogRouter.get('/my-blogs', authMiddleware, blogController.getOwnerBlogs);
blogRouter.get('/:id', blogController.getOneBlog);

//Get all blogs
blogRouter.get('/', blogController.getAllBlogs);

//Create blog
blogRouter.post('/', authMiddleware, blogController.createBlog);

//update a blog
blogRouter.put('/:id', authMiddleware, blogController.updateBlog);

//delete a blog
blogRouter.delete('/:id', authMiddleware, blogController.deleteBlog);

module.exports = blogRouter;
