# Blog API

A simple REST API for a blogging platform.

## Features
- User Authentication (Signup/Signin)
- Create, Read, Update, Delete (CRUD) Blogs
- Public vs Draft states
- Calculating reading time automatically
- Pagination, Filtering, Sorting

## API Endpoints

### Auth
- `POST /auth/signup` - Register a new user
- `POST /auth/signin` - Login and receive a token

### Views (UI)
- `GET /` - Public Blog Index
- `GET /signin` & `GET /signup` - Auth Pages
- `GET /dashboard` - User Dashboard (My Blogs)
- `GET /new-blog` - Create Blog Form
- `GET /blog/:id` - Show Blog
- `GET /blog/:id/edit` - Edit Blog Form

### Blogs (API)
- `GET /blogs` - Get all published blogs (Public)
    - Query Params: `page`, `limit`, `state` (default: published), `order_by` (timestamp, read_count, etc.)
- `POST /blogs` - Create a new blog (Authenticated)
- `GET /blogs/my-blogs` - Get blogs owned by the logged-in user (Authenticated, includes drafts)
- `GET /blogs/:id` - Get a single blog by ID (Public, increments read count)
- `PUT /blogs/:id` - Update a blog (Authenticated, must be owner)
- `DELETE /blogs/:id` - Delete a blog (Authenticated, must be owner)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configuration:
   - Ensure `.env` file exists with `MONGODB_URI` and `SECRET_KEY`.

3. Run Server:
   ```bash
   npm start
   ```

## Testing

Run the integration tests using Jest:
```bash
npm test
```