const jwt = require("jsonwebtoken");
const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

const getTokenFrom = (request) => {
	const authorization = request.get("authorization");
	if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
		return authorization.substring(7);
	}
	return null;
};

blogsRouter.get("/", async (request, response, next) => {
	try {
		const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
		response.json(blogs);
	} catch (err) {
		next(err);
	}
});

blogsRouter.post("/", async (request, response, next) => {
	try {
		const token = getTokenFrom(request);
		const decodedToken = jwt.verify(token, process.env.SECRET);
		if (!decodedToken.id) {
			return response.status(401).json({ error: "token missing or invalid" });
		}
		const user = await User.findById(decodedToken.id);
		const blog = new Blog({
			user: user._id,
			title: request.body.title,
			author: request.body.author,
			url: request.body.url,
			likes: request.body.likes,
		});

		if (!blog.title || !blog.url) {
			response.status(400).end();
		} else {
			const result = await blog.save();
			user.blogs = user.blogs.concat(result._id);
			await user.save();

			response.status(201).json(result);
		}
	} catch (err) {
		next(err);
	}
});

blogsRouter.delete("/:id", async (request, response, next) => {
	try {
		await Blog.deleteOne({ _id: request.params.id });
		response.status(204).end();
	} catch (err) {
		next(err);
	}
});

blogsRouter.put("/:id", async (request, response, next) => {
	try {
		const thisBlog = await Blog.findById(request.params.id);
		const updatedBlog = {
			title: request.body.title,
			author: request.body.author,
			url: request.body.url,
			likes: request.body.likes || thisBlog.likes,
		};
		// await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true });
		await Blog.updateOne(thisBlog, updatedBlog);
		response.status(200).json(updatedBlog);
	} catch (err) {
		next(err);
	}
});
module.exports = blogsRouter;
