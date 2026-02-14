const express = require('express');
const router = express.Router();
const BlogService = require('../services/blog.service');
const authMiddleware = require('../middlewares/auth.middleware');

// Public Home - List Published Blogs
router.get('/', async (req, res) => {
	try {
		const blogs = await BlogService.getAllBlogs({
			state: 'published',
			order_by: 'timestamp',
		});
		res.render('index', { blogs, user: req.user || null });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Auth Forms
router.get('/signup', (req, res) => {
	res.render('signup');
});

router.get('/signin', (req, res) => {
	res.render('signin');
});

// Helper Middlewares for Views
const checkUser = (req, res, next) => {
	const token = req.cookies.token;
	if (token) {
		const jwt = require('jsonwebtoken');
		try {
			const decoded = jwt.verify(token, process.env.SECRET_KEY);
			req.user = decoded;
		} catch (err) {
			res.clearCookie('token');
		}
	}
	next();
};

const requireAuth = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		return res.redirect('/signin');
	}
	const jwt = require('jsonwebtoken');
	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY);
		req.user = decoded;
		next();
	} catch (err) {
		res.clearCookie('token');
		return res.redirect('/signin');
	}
};

router.use(checkUser);

router.get('/dashboard', requireAuth, async (req, res) => {
	try {
		// reuse getOwnerBlogs from service
		const blogs = await BlogService.getOwnerBlogs(req.user.id, {
			order_by: 'timestamp',
		});
		res.render('dashboard', { blogs, user: req.user });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// New Blog Form (Protected)
router.get('/new-blog', requireAuth, (req, res) => {
	res.render('new', { user: req.user });
});

// Edit Blog Form (Protected)
router.get('/blog/:id/edit', requireAuth, async (req, res) => {
	try {
		const blog = await BlogService.getOneBlog(req.params.id);
		if (!blog) return res.status(404).send('Blog not found');
		if (
			blog.author._id?.toString() !== req.user.id &&
			blog.author.toString() !== req.user.id
		)
			return res.status(403).send('Unauthorized');
		res.render('edit', { blog, user: req.user });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Show Single Blog
router.get('/blog/:id', async (req, res) => {
	try {
		// Service handles increment if second arg is true
		const blog = await BlogService.getOneBlog(req.params.id, true);

		if (!blog) return res.status(404).send('Blog not found');

		res.render('show', { blog, user: req.user });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
