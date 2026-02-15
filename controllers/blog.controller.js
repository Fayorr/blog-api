const express = require('express');
const router = express.Router();
const BlogService = require('../services/blog.service');

//get all blogs
const getAllBlogs = async (req, res) => {
	try {
		const blogs = await BlogService.getAllBlogs(req.query);
		res.status(200).json(blogs);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// get one blog
const getOneBlog = async (req, res) => {
	try {
		const { id } = req.params;
		const blog = await BlogService.getOneBlog(id, true); // true for read count increment

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
		const blogData = { ...req.body, author: req.user.id };
		const blog = await BlogService.createBlog(blogData);
		// If request came from a form, redirect to dashboard
		if (
			req.headers['content-type']?.includes('application/x-www-form-urlencoded')
		) {
			return res.redirect('/dashboard');
		}
		res.status(201).json(blog);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// update blog
const updateBlog = async (req, res) => {
	try {
		const { id } = req.params;
		// Check service logic for specific error types or handle generally
		const blog = await BlogService.updateBlog(id, req.user.id, req.body);

		if (!blog) {
			return res.status(404).json({ error: 'Blog not found' });
		}

		// If request came from a form, redirect to dashboard
		if (
			req.headers['content-type']?.includes('application/x-www-form-urlencoded')
		) {
			return res.redirect('/dashboard');
		}
		res.status(200).json(blog);
	} catch (error) {
		if (error.message === 'Unauthorized') {
			return res
				.status(403)
				.json({ error: 'You are not authorized to update this blog' });
		}
		res.status(500).json({ error: error.message });
	}
};

// delete blog
const deleteBlog = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await BlogService.deleteBlog(id, req.user.id);

		if (!result) {
			// null if not found
			return res.status(404).json({ error: 'Blog not found' });
		}

		// If request came from a form, redirect to dashboard
		if (
			req.headers['content-type']?.includes('application/x-www-form-urlencoded')
		) {
			return res.redirect('/dashboard');
		}
		res.status(200).json({ message: 'Blog deleted successfully' });
	} catch (error) {
		if (error.message === 'Unauthorized') {
			return res
				.status(403)
				.json({ error: 'You are not authorized to delete this blog' });
		}
		res.status(500).json({ error: error.message });
	}
};

// get owner blogs
const getOwnerBlogs = async (req, res) => {
	try {
		const blogs = await BlogService.getOwnerBlogs(req.user.id, req.query);
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
