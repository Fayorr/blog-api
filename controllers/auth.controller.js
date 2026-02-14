const express = require('express');
const { Router } = require('express');
const router = Router();
const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;

const signup = async (req, res) => {
	try {
		const { first_name, last_name, email, password } = req.body;
		const user = await UserModel.findOne({ email });
		if (user) {
			return res.status(400).json({ message: 'User already exists' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await UserModel.create({
			first_name,
			last_name,
			email,
			password: hashedPassword,
		});
		const token = jwt.sign({ id: newUser._id }, secretKey, { expiresIn: '1h' });

		// Set cookie and redirect
		res.cookie('token', token, { httpOnly: true });
		res.redirect('/dashboard');
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const signin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await UserModel.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'User not found' });
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ message: 'Invalid Credentials' });
		}
		const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

		// Set cookie and redirect
		res.cookie('token', token, { httpOnly: true });
		res.redirect('/dashboard');
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	signup,
	signin,
};
