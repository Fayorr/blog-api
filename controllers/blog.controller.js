const express = require('express');
const router = express.Router();
const BlogModel = require('../models/blog.model');

//get all blogs
const getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, order_by = 'timestamp', state = 'published', ...filters } = req.query;

        // Build query
        const query = { state, ...filters };

        // Determine sort order
        const sort = {};
        if (order_by === 'timestamp') {
            sort.createdAt = -1; // Default to newest first
        } else if (order_by === 'read_count') {
            sort.read_count = -1;
        } else {
            sort[order_by] = 1;
        }

        const skip = (page - 1) * limit;

        const blogs = await BlogModel.find(query)
            .sort(sort)
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get one blog
const getOneBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await BlogModel.findByIdAndUpdate(id, { $inc: { read_count: 1 } }, { new: true })
            .populate('description', '-password'); // 'description' is the user ref based on the schema

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// create blog
const createBlog = async (req, res) => {
    try {
        const blog = await BlogModel.create(req.body);
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// update blog
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await BlogModel.findById(id);

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to update this blog' });
        }

        // Update fields
        Object.assign(blog, req.body);
        await blog.save();

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// delete blog
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await BlogModel.findById(id);

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to delete this blog' });
        }

        await blog.deleteOne();
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get owner blogs
const getOwnerBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, order_by = 'timestamp', ...filters } = req.query;

        // Build query - force author to be current user
        const query = { author: req.user.id, ...filters };
        // Note: 'author' field is [String] in schema but prompt implies single author ID ownership check. 
        // If schema meant 'description' as user ref, we might need to adjust, but based on updateBlog check:
        // if (blog.author.toString() !== req.user.id) ... 
        // I will use 'author' here for consistency with that check. 
        // Use 'description' if strict population needed, but author seems to be the ownership field per prompt.

        // Wait, if author is array, finding by author: req.user.id works if array contains it? 
        // Mongoose: { author: value } matches if array contains value.
        // However, previous check was strict equality on toString(), implying single value or array string conversion.
        // I'll stick to 'author' field.

        // Determine sort order
        const sort = {};
        if (order_by === 'timestamp') {
            sort.createdAt = -1;
        } else if (order_by === 'read_count') {
            sort.read_count = -1;
        } else {
            sort[order_by] = 1;
        }

        const skip = (page - 1) * limit;

        const blogs = await BlogModel.find(query)
            .sort(sort)
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllBlogs,
    getOneBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    getOwnerBlogs,
};