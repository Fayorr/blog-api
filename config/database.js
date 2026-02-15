const mongoose = require('mongoose');
require('dotenv').config();

let cachedConnection = null;

const connectToDB = async () => {
	if (cachedConnection) return cachedConnection;

	cachedConnection = mongoose
		.connect(process.env.MONGODB_URI)
		.then(() => {
			console.log('Connected to MongoDB');
		})
		.catch((error) => {
			cachedConnection = null;
			console.error('Error connecting to MongoDB:', error);
			throw error;
		});

	return cachedConnection;
};

// Middleware that ensures DB is connected before handling requests
const ensureConnection = async (req, res, next) => {
	try {
		await connectToDB();
		next();
	} catch (error) {
		res.status(500).json({ error: 'Database connection failed' });
	}
};

module.exports = { connectToDB, ensureConnection };
