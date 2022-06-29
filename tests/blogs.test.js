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
			title: "Keyboard Fanatic",
			author: "Alfred Mah",
			url: "http://kbdfans.com",
			likes: 233,
			user: "62bcc5fb5f5f5bdf01007b8f",
			__v: 0,
		};

		await api
			.post("/api/blogs")
			.send(newBlog)
			.set({
				Authorization:
					"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhlbGxhcyIsImlkIjoiNjJiY2M1ZmI1ZjVmNWJkZjAxMDA3YjhmIiwiaWF0IjoxNjU2NTQyMzYwLCJleHAiOjE2NTY1NDU5NjB9.vL4x_jC2SoNGCoUn6B7zPyD8bpcZv_2f3rr8Gs8rI_U",
			})
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
			title: "Keyboard Fanatic",
			author: "Alfred Mah",
			url: "http://kbdfans.com",
			user: "62bcc5fb5f5f5bdf01007b8f",
			__v: 0,
		};

		const response = await api
			.post("/api/blogs")
			.send(newBlog)
			.set({
				Authorization:
					"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhlbGxhcyIsImlkIjoiNjJiY2M1ZmI1ZjVmNWJkZjAxMDA3YjhmIiwiaWF0IjoxNjU2NTQyMzYwLCJleHAiOjE2NTY1NDU5NjB9.vL4x_jC2SoNGCoUn6B7zPyD8bpcZv_2f3rr8Gs8rI_U",
			})
			.expect(201)
			.expect("Content-Type", /application\/json/);
		const blogId = response.body.id;
		const newPost = await helper.blogsInDb();
		const contents = newPost.find((blog) => blog.id === blogId);

		expect(newPost).toHaveLength(helper.initialBlogs.length + 1);
		expect(contents.likes).toEqual(0);
	});

	test("return status code 400 if title and url properties are missing", async () => {
		const newBlog = {
			author: "Alfred Mah",
			likes: 233,
			user: "62bcc5fb5f5f5bdf01007b8f",
			__v: 0,
		};

		await api
			.post("/api/blogs")
			.set({
				Authorization:
					"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhlbGxhcyIsImlkIjoiNjJiY2M1ZmI1ZjVmNWJkZjAxMDA3YjhmIiwiaWF0IjoxNjU2NTQyMzYwLCJleHAiOjE2NTY1NDU5NjB9.vL4x_jC2SoNGCoUn6B7zPyD8bpcZv_2f3rr8Gs8rI_U",
			})
			.send(newBlog)
			.expect(400);
	});

	test("return status code 401 if token is not provided", async () => {
		const newBlog = {
			author: "Alfred Mah",
			likes: 233,
			user: "62bcc5fb5f5f5bdf01007b8f",
			__v: 0,
		};

		await api.post("/api/blogs").send(newBlog).expect(401);
	});
});

describe("deletion of a single post", () => {
	test("succeeds with status code 204 if id is valid", async () => {
		const blogAtStart = await helper.blogsInDb();
		const blogToDelete = blogAtStart[0];
		const requestedBy = {
			username: "root",
			name: "Superuser",
			user: "62bcc5bd5f5f5bdf01007b89",
		};
		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.send(requestedBy)
			.set({
				Authorization:
					"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjYyYmNjNWJkNWY1ZjViZGYwMTAwN2I4OSIsImlhdCI6MTY1NjU0MjMyNSwiZXhwIjoxNjU2NTQ1OTI1fQ.qACrOBBY_sxyz1pNicgzxVv8kFMSGrZzVdK7L7U4oXQ",
			})
			.expect(204);
	});

	test("deleted post is no longer in the database", async () => {
		const blogAtStart = await helper.blogsInDb();
		const blogToDelete = blogAtStart[0];
		const requestedBy = {
			username: "root",
			name: "Superuser",
			user: "62bcc5bd5f5f5bdf01007b89",
		};
		await api.delete(`/api/blogs/${blogToDelete.id}`).send(requestedBy).set({
			Authorization:
				"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjYyYmNjNWJkNWY1ZjViZGYwMTAwN2I4OSIsImlhdCI6MTY1NjU0MjMyNSwiZXhwIjoxNjU2NTQ1OTI1fQ.qACrOBBY_sxyz1pNicgzxVv8kFMSGrZzVdK7L7U4oXQ",
		});

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
