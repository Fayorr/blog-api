require('dotenv').config();
const db = require('./config/database');
const express = require('express');
const cors = require('cors');
const cookieparser = require('cookie-parser');
const morgan = require('morgan');
const methodOverride = require('method-override');
const taskRouter = require('./routes/task.router');
const authRouter = require('./routes/auth.router');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
	cors({
		origin: [
			'http://localhost:5173',
			'https://my-todo-frontend-l8n8.onrender.com',
		],
		credentials: true,
	}),
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieparser());
// app.set('view engine', 'ejs');
// app.set('views', './views');

// Connect to DB for every request (Serverless pattern)
app.use(async (req, res, next) => {
	try {
		await db.connectToDB();
		next();
	} catch (error) {
		next(error);
	}
});
// Routes
app.use('/auth', authRouter);
app.use('/tasks', taskRouter);

app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the Todo App API' });
});
// app.get('/login', (req, res) => {
// 	res.render('login');
// });
// app.get('/register', (req, res) => {
// 	res.render('register');
// });
// app.get('/create', (req, res) => {
// 	res.render('create');
// });

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
