require('dotenv').config();
const path = require('path');
const db = require('./config/database');
const express = require('express');
const cors = require('cors');
const cookieparser = require('cookie-parser');
const morgan = require('morgan');
const methodOverride = require('method-override');
const blogRouter = require('./routes/blog.router');
const authRouter = require('./routes/auth.router');
const authMiddleware = require('./middlewares/auth.middleware');

const app = express();
const PORT = process.env.PORT || 8000;
// Connect to MongoDB immediately (needed for Vercel serverless)
// Skip during testing to avoid connection conflicts
if (process.env.NODE_ENV !== 'test') {
	db.connectToDB();
}

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieparser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ensure DB connection before any request
app.use(db.ensureConnection);

// Routes
const viewRouter = require('./routes/view.router');
app.use('/', viewRouter);
app.use('/auth', authRouter);
app.use('/blogs', blogRouter);

// Error handling middleware
function errorHandler(err, req, res, next) {
	console.error(err.message);

	// Auth-related errors
	if (
		err.message === 'Invalid email or password' ||
		err.message === 'User already exists' ||
		err.message === 'Passwords do not match'
	) {
		const statusCode = 400;
		return res
			.status(statusCode)
			.json({ error: err.message, status: statusCode });
	}

	const statusCode = err.statusCode || 500;
	const message = err.statusCode
		? err.message
		: 'Something went wrong, please try again later';

	// Always return JSON
	return res.status(statusCode).json({ message, status: statusCode });
}
app.use(errorHandler);

if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

module.exports = app;
