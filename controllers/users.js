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
		response.status(201).json(savedUser);
	} catch (err) {
		next(err);
	}
});

module.exports = usersRouter;
