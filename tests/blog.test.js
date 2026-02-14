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
    it('should sign up a user', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send({
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                password: 'password123'
            });
        if (res.statusCode !== 201) {
            throw new Error(`Signup failed: ${JSON.stringify(res.body)}`);
        }
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        token = res.body.token; // Save token for future requests
    });

    it('should sign in the user', async () => {
        const res = await request(app)
            .post('/auth/signin')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;

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
                title: 'My First Blog',
                description: 'Description here',
                title: 'Test Blog',
                tags: 'tech',
                body: 'This is a test blog body.',
                description: userId,
                author: [userId]
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
                title: 'Updated Title'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual('Updated Title');
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
