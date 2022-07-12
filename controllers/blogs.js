const jwt = require("jsonwebtoken");
const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

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
		const decodedToken = jwt.verify(request.token, process.env.SECRET);
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
		}
		const result = await blog.save();
		user.blogs = user.blogs.concat(result._id);
		await user.save();

		response.status(201).json(result);
	} catch (err) {
		next(err);
	}
});

blogsRouter.delete("/:id", async (request, response, next) => {
	try {
		const decodedToken = jwt.verify(request.token, process.env.SECRET);
		if (!decodedToken.id) {
			return response.status(401).json({ error: "token missing or invalid" });
		}

		const id = request.params.id;
		const blog = await Blog.findById(id);
		if (blog.id.toString() === request.body.id.toString()) {
			await Blog.deleteOne({ _id: id });

			response.status(204).end();
		} else {
			response.status(401).json({ error: "Only blog owner may delete this post" });
		}
	} catch (err) {
		next(err);
	}
});

blogsRouter.put("/:id", async (request, response, next) => {
	try {
		const decodedToken = jwt.verify(request.token, process.env.SECRET);
		if (!decodedToken.id) {
			return response.status(401).json({ error: "token missing or invalid" });
		}

		const thisBlog = await Blog.findById(request.params.id);
		const updatedBlog = {
			user: request.params.id,
			title: request.body.title,
			author: request.body.author,
			url: request.body.url,
			likes: request.body.likes || thisBlog.likes,
		};
		await Blog.updateOne(thisBlog, updatedBlog);
		response.status(200).json(updatedBlog);
	} catch (err) {
		next(err);
	}
});
module.exports = blogsRouter;
