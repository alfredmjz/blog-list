const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response, next) => {
	try {
		const users = await User.find({}).populate("blogs", { title: 1, url: 1 });
		response.json(users);
	} catch (err) {
		next(err);
	}
});

usersRouter.post("/register", async (request, response, next) => {
	try {
		const { username, name, password } = request.body;
		if (!username || !password) {
			return response.status(400).json({
				error: "username and password are required",
			});
		}

		if (username.length < 3 || password.length < 3) {
			return response.status(400).json({
				error: "username and password must be at least 3 characters long",
			});
		}
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return response.status(400).json({
				error: "username must be unique",
			});
		}
		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);
		const user = new User({
			username,
			name,
			passwordHash,
		});
		const savedUser = await user.save();
		const userForToken = {
			username: savedUser.username,
			id: savedUser._id,
		};
		const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 });

		response.status(201).json({ loginUser: { token, username, name }, savedUser });
	} catch (err) {
		next(err);
	}
});

module.exports = usersRouter;
