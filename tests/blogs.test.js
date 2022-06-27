const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);
const Blog = require("../models/blog");

beforeEach(async () => {
	await Blog.deleteMany({});
	for (let blog of helper.initialBlogs) {
		let blogObject = new Blog(blog);
		await blogObject.save();
	}
});

describe("when a blog post is saved", () => {
	test("blogs are returned as json", async () => {
		await api
			.get("/api/blogs")
			.expect(200)
			.expect("Content-Type", /application\/json/);
	});

	test("all blogs are returned", async () => {
		const response = await api.get("/api/blogs");
		expect(response.body).toHaveLength(helper.initialBlogs.length);
	});

	test("each blog has a unique identifier id", async () => {
		const response = await api.get("/api/blogs");
		const ids = response.body.map((blog) => blog.id);
		expect(ids).toBeDefined();
	});

	test("a new blog is created and saved", async () => {
		const newBlog = {
			_id: "5a422bc61b54a676234d17fd",
			title: "Keyboard Fanatic",
			author: "Alfred Mah",
			url: "http://kbdfans.com",
			likes: 233,
			__v: 0,
		};

		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(201)
			.expect("Content-Type", /application\/json/);

		const newPost = await helper.blogsInDb();
		const contents = newPost.map((blog) => blog.title);

		expect(newPost).toHaveLength(helper.initialBlogs.length + 1);
		expect(contents).toContain("Keyboard Fanatic");
	});
});

describe("invalid requests are handled", () => {
	test("the likes property is default to 0 if missing", async () => {
		const newBlog = {
			_id: "5a422bc61b54a676234d17fd",
			title: "Keyboard Fanatic",
			author: "Alfred Mah",
			url: "http://kbdfans.com",
			__v: 0,
		};

		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(201)
			.expect("Content-Type", /application\/json/);
		const newPost = await helper.blogsInDb();
		const contents = newPost.find((blog) => blog.id === "5a422bc61b54a676234d17fd");

		expect(newPost).toHaveLength(helper.initialBlogs.length + 1);
		expect(contents.likes).toEqual(0);
	});

	test("return status code 400 if title and url properties are missing", async () => {
		const newBlog = {
			_id: "5a422bc61b54a676234d17fd",
			author: "Alfred Mah",
			likes: 2,
			__v: 0,
		};

		await api.post("/api/blogs").send(newBlog).expect(400);
	});
});

describe("deletion of a single post", () => {
	test("succeeds with status code 204 if id is valid", async () => {
		const blogAtStart = await helper.blogsInDb();
		const blogToDelete = blogAtStart[0];
		await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
	});

	test("deleted post is no longer in the database", async () => {
		const blogAtStart = await helper.blogsInDb();
		const blogToDelete = blogAtStart[0];
		await api.delete(`/api/blogs/${blogToDelete.id}`);

		const blogAtEnd = await helper.blogsInDb();
		expect(blogAtEnd).toHaveLength(helper.initialBlogs.length - 1);

		const contents = blogAtEnd.map((blog) => blog);
		expect(contents).not.toContain(blogToDelete);
	});
});

describe("update information of an individual post", () => {
	test("succeeds with status code 200 if id is valid", async () => {
		const blogAtStart = await helper.blogsInDb();
		const blogToUpdate = blogAtStart[0];
		const updatedBlog = {
			title: "How send a PUT request?",
			author: "Tester",
			url: "www.puttest.com",
			likes: 10,
		};
		await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200);
	});

	test("contents are changed", async () => {
		const blogAtStart = await helper.blogsInDb();
		const blogToUpdate = blogAtStart[0];
		const newContents = {
			title: "How send a PUT request?",
			author: "Tester",
			url: "www.puttest.com",
			likes: 10,
		};
		const response = await api.put(`/api/blogs/${blogToUpdate.id}`).send(newContents);
		expect(JSON.parse(response.text)).toEqual(newContents);
	});
});

afterAll(() => {
	mongoose.connection.close();
});
