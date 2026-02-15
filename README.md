# Blog API

A simple REST API for a blogging platform.

## Features

- User Authentication (Signup/Signin/Logout)
- Create, Read, Update, Delete (CRUD) Blogs
- Public vs Draft states
- Calculating reading time automatically
- Pagination, Filtering, Sorting
- Responsive UI (EJS)
- Vercel Deployment Support

## Link to ERD Diagram

[ERD Diagram](https://drawsql.app/teams/testdb-15/diagrams/blog-api)

## API Endpoints

### Auth

- `POST /auth/signup` - Register a new user
- `POST /auth/signin` - Login and receive a token
- `GET /auth/logout` - Logout and clear session cookie

### Views (UI)

- `GET /` - Static Landing Page (Welcome)
- `GET /blog-list` - Public Blog Index (HTML View)
- `GET /signin` & `GET /signup` - Auth Pages
- `GET /dashboard` - User Dashboard (My Blogs, Authenticated)
- `GET /new-blog` - Create Blog Form (Authenticated)
- `GET /blog/:id` - Show Blog (HTML View)
- `GET /blog/:id/edit` - Edit Blog Form (Authenticated)

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
