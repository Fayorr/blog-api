// This function should intercept requests, check the Authorization header, verify the token, and attach the user to req.user.

const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {
	try {
		// Check cookie first (web/browser), then Authorization header (API)
		let token = req.cookies?.token;
		if (!token && req.headers.authorization) {
			token = req.headers.authorization.split(' ')[1];
		}
		if (!token) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		const decodedToken = jwt.verify(token, secretKey);
		req.user = decodedToken;
		next();
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = authMiddleware;
