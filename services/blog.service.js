const BlogModel = require('../models/blog.model');

// Get all blogs with filtering, sorting, and pagination
const getAllBlogs = async (query) => {
	const {
		page = 1,
		limit = 20,
		order_by = 'timestamp',
		state = 'published',
		...filters
	} = query;

	const buildQuery = { state, ...filters };

	const sort = {};
	if (order_by === 'timestamp') {
		sort.createdAt = -1;
	} else if (order_by === 'read_count') {
		sort.read_count = -1;
	} else {
		sort[order_by] = 1;
	}

	const skip = (page - 1) * limit;

	const blogs = await BlogModel.find(buildQuery)
		.populate('author', 'first_name last_name')
		.sort(sort)
		.skip(parseInt(skip))
		.limit(parseInt(limit));

	return blogs;
};

// Get a single blog by ID
const getOneBlog = async (id, incrementReadCount = false) => {
	const query = BlogModel.findById(id).populate(
		'author',
		'first_name last_name',
	);

	if (incrementReadCount) {
		// We use findByIdAndUpdate to atomic increment if just read count,
		// but for consistency with previous logic which fetched then updated:
		// modifying it to be more robust.
		// Actually, findByIdAndUpdate is better for atomic increment.
		const blog = await BlogModel.findByIdAndUpdate(
			id,
			{ $inc: { read_count: 1 } },
			{ new: true },
		).populate('author', 'first_name last_name');
		return blog;
	} else {
		return query;
	}
};

// Create a new blog
const createBlog = async (data) => {
	return await BlogModel.create(data);
};

// Update a blog
const updateBlog = async (id, userId, data) => {
	const blog = await BlogModel.findById(id);
	if (!blog) return null;

	if (
		blog.author._id?.toString() !== userId &&
		blog.author.toString() !== userId
	) {
		throw new Error('Unauthorized');
	}

	Object.assign(blog, data);
	return await blog.save();
};

// Delete a blog
const deleteBlog = async (id, userId) => {
	const blog = await BlogModel.findById(id);
	if (!blog) return null;

	if (
		blog.author._id?.toString() !== userId &&
		blog.author.toString() !== userId
	) {
		throw new Error('Unauthorized');
	}

	await blog.deleteOne();
	return true;
};

// Get blogs owned by a user
const getOwnerBlogs = async (userId, query) => {
	const { page = 1, limit = 20, order_by = 'timestamp', ...filters } = query;

	const buildQuery = { author: userId, ...filters };

	const sort = {};
	if (order_by === 'timestamp') {
		sort.createdAt = -1;
	} else if (order_by === 'read_count') {
		sort.read_count = -1;
	} else {
		sort[order_by] = 1;
	}

	const skip = (page - 1) * limit;

	const blogs = await BlogModel.find(buildQuery)
		.sort(sort)
		.skip(parseInt(skip))
		.limit(parseInt(limit));

	return blogs;
};

module.exports = {
	getAllBlogs,
	getOneBlog,
	createBlog,
	updateBlog,
	deleteBlog,
	getOwnerBlogs,
};
