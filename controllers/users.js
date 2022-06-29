const bcrypt = require("bcrypt");
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

usersRouter.post("/", async (request, response, next) => {
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
		console.log(passwordHash);
		const user = new User({
			username,
			name,
			passwordHash,
		});
		console.log(user);
		const savedUser = await user.save();
		response.status(201).json(savedUser);
	} catch (err) {
		next(err);
	}
});

module.exports = usersRouter;
