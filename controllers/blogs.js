const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response, next) => {
	try {
		const blogs = await Blog.find({});
		response.json(blogs);
	} catch (err) {
		next(err);
	}
});

blogsRouter.post("/", async (request, response, next) => {
	try {
		const blog = new Blog(request.body);
		if (!blog.title || !blog.url) {
			response.status(400).end();
		} else {
			const result = await blog.save();
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
