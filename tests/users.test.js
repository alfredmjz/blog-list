const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);
const User = require("../models/user");

beforeEach(async () => {
	await User.deleteMany({});
	for (let user of helper.initialUsers) {
		let userObject = new User(user);
		await userObject.save();
	}
});

describe("when a new user is created", () => {
	test("invalid users return status code 400", async () => {
		const duplicateUser = {
			username: "root",
			name: "Superuser",
			password: "dupsuser",
		};
		await api
			.post("/api/users")
			.send(duplicateUser)
			.expect(400)
			.expect("Content-Type", /application\/json/);
	});

	test("invalid users are not created", async () => {
		const invalidUser = {
			name: "Superuser",
		};

		await api.post("/api/users").send(invalidUser);
		const userAtEnd = await helper.usersInDb();
		expect(userAtEnd).toHaveLength(helper.initialUsers.length);

		const allUser = userAtEnd.map((user) => user);
		expect(allUser).not.toContain(invalidUser);
	});
});

afterAll(() => {
	mongoose.connection.close();
});
