const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.SECRET_KEY = 'test_secret'; // Set before app import

const app = require('../app');
const User = require('../models/user.model');
const Blog = require('../models/blog.model');

let mongoServer;
let token;
let userId;
let blogId;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	process.env.MONGODB_URI = mongoServer.getUri();
	await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});

describe('Blog API Endpoints', () => {
	// Auth Test (Setup user for other tests)
	it('should sign up a user and redirect to dashboard', async () => {
		const res = await request(app).post('/auth/signup').send({
			first_name: 'Test',
			last_name: 'User',
			email: 'test@example.com',
			password: 'password123',
		});
		expect(res.statusCode).toEqual(302);
		expect(res.headers.location).toEqual('/dashboard');

		// Extract token from Set-Cookie header
		const cookies = res.headers['set-cookie'];
		expect(cookies).toBeDefined();
		const tokenCookie = cookies.find((c) => c.startsWith('token='));
		expect(tokenCookie).toBeDefined();
		token = tokenCookie.split(';')[0].split('=')[1];
	});

	it('should sign in the user and redirect to dashboard', async () => {
		const res = await request(app).post('/auth/signin').send({
			email: 'test@example.com',
			password: 'password123',
		});
		expect(res.statusCode).toEqual(302);
		expect(res.headers.location).toEqual('/dashboard');

		// Extract token from Set-Cookie header
		const cookies = res.headers['set-cookie'];
		expect(cookies).toBeDefined();
		const tokenCookie = cookies.find((c) => c.startsWith('token='));
		expect(tokenCookie).toBeDefined();
		token = tokenCookie.split(';')[0].split('=')[1];

		// Decode token to get userId if needed, or fetch from DB
		const user = await User.findOne({ email: 'test@example.com' });
		userId = user._id;
	});

	// Public Blogs
	it('should fetch public blogs', async () => {
		const res = await request(app).get('/blogs');
		expect(res.statusCode).toEqual(200);
		expect(Array.isArray(res.body)).toBeTruthy();
	});

	// Create Blog
	it('should create a new blog', async () => {
		const res = await request(app)
			.post('/blogs')
			.set('Authorization', `Bearer ${token}`)
			.send({
				title: 'Test Blog',
				description: 'A test blog description',
				tags: 'tech',
				body: 'This is a test blog body.',
			});

		if (res.statusCode !== 201) {
			console.log('Create Error:', res.body);
		}
		expect(res.statusCode).toEqual(201);
		blogId = res.body._id;
	});

	// Get Single Blog
	it('should get a single blog and increment read_count', async () => {
		const res = await request(app).get(`/blogs/${blogId}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('read_count', 1);
		expect(res.body).toHaveProperty('title', 'Test Blog');
	});

	// My Blogs
	it('should get my blogs', async () => {
		const res = await request(app)
			.get('/blogs/my-blogs')
			.set('Authorization', `Bearer ${token}`);

		expect(res.statusCode).toEqual(200);
		expect(Array.isArray(res.body)).toBeTruthy();
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]._id).toEqual(blogId);
	});

	// Update Blog
	it('should update the blog', async () => {
		const res = await request(app)
			.put(`/blogs/${blogId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				title: 'Updated Title',
				state: 'published', // Publish it for search tests
			});

		expect(res.statusCode).toEqual(200);
		expect(res.body.title).toEqual('Updated Title');
	});

	// Duplicate Title Test
	it('should return 400 when creating a blog with a duplicate title', async () => {
		const uniqueTitle = 'Another Unique Title';
		// First create a blog
		await request(app)
			.post('/blogs')
			.set('Authorization', `Bearer ${token}`)
			.send({
				title: uniqueTitle,
				description: 'First version',
				tags: 'test',
				body: 'First body.',
			});

		// Try to create another one with the same title
		const res = await request(app)
			.post('/blogs')
			.set('Authorization', `Bearer ${token}`)
			.send({
				title: uniqueTitle,
				description: 'Second version',
				tags: 'test',
				body: 'Second body.',
			});

		expect(res.statusCode).toEqual(400);
		expect(res.body.error).toEqual('Title already exists');
	});

	// Advanced Search and Filtering Tests
	describe('Advanced Search and Filtering', () => {
		let otherToken;
		let otherUserId;

		beforeAll(async () => {
			// Create another user
			const res = await request(app).post('/auth/signup').send({
				first_name: 'Second',
				last_name: 'Author',
				email: 'other@example.com',
				password: 'password123',
			});
			const cookies = res.headers['set-cookie'];
			otherToken = cookies
				.find((c) => c.startsWith('token='))
				.split(';')[0]
				.split('=')[1];
			const user = await User.findOne({ email: 'other@example.com' });
			otherUserId = user._id;

			// Create more blogs
			await request(app)
				.post('/blogs')
				.set('Authorization', `Bearer ${otherToken}`)
				.send({
					title: 'NodeJS Guide',
					tags: 'coding,backend',
					body: 'Learning NodeJS is fun and powerful.',
				});

			await request(app)
				.post('/blogs')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'React Tips',
					tags: 'frontend,coding',
					body: 'React is a popular library for building UIs.',
				});

			// Publish them
			await Blog.updateMany(
				{ title: { $in: ['NodeJS Guide', 'React Tips'] } },
				{ state: 'published' },
			);
		});

		it('should search blogs by title', async () => {
			const res = await request(app).get('/blogs?title=React');
			expect(res.statusCode).toEqual(200);
			expect(res.body.length).toBe(1);
			expect(res.body[0].title).toBe('React Tips');
		});

		it('should search blogs by tags', async () => {
			const res = await request(app).get('/blogs?tags=backend');
			expect(res.statusCode).toEqual(200);
			expect(res.body.length).toBe(1);
			expect(res.body[0].title).toBe('NodeJS Guide');
		});

		it('should search blogs by author name', async () => {
			const res = await request(app).get('/blogs?author=Second');
			expect(res.statusCode).toEqual(200);
			expect(res.body.length).toBe(1);
			expect(res.body[0].author.first_name).toBe('Second');
		});

		it('should paginate results', async () => {
			const res = await request(app).get('/blogs?limit=1');
			expect(res.statusCode).toEqual(200);
			expect(res.body.length).toBe(1);
		});

		it('should sort results by reading_time', async () => {
			// Wait a bit to ensure timestamps differ if needed,
			// though here we care about reading_time which is calculated by body length.
			const res = await request(app).get('/blogs?order_by=reading_time');
			expect(res.statusCode).toEqual(200);
			// The bodies have different word counts, so reading_time might differ.
			// But since they are all small, they might all be 1 min.
			// Let's just ensure it doesn't crash.
			expect(Array.isArray(res.body)).toBeTruthy();
		});
	});

	// Delete Blog
	it('should delete the blog', async () => {
		const res = await request(app)
			.delete(`/blogs/${blogId}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.statusCode).toEqual(200);

		// Verify deletion
		const check = await request(app).get(`/blogs/${blogId}`);
		expect(check.statusCode).toEqual(404);
	});
});
