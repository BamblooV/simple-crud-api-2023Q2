import request from "supertest";
import dotenv from "dotenv";
import { v4 } from "uuid";
import Server from "../framework/Server";
import getRouter from "../routes/routes";
import { StatusCode } from "../framework/statusCodes";
import { User, UserDTO } from "../models/User.model";
import { ArgumentError, InternalError, UserExistingError } from "../errors";
import UserService from "../services/User.service";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "8000");
const HOST = `localhost:${PORT}`;

let app: Server;

const user: UserDTO = {
  username: "Asdf",
  age: 12,
  hobbies: ["tea", "coffe"],
};

describe("GET api/users tests", () => {
  beforeAll(async () => {
    app = new Server();
    app.use(getRouter(new UserService())).listen(PORT);
  });

  afterAll(() => {
    app.close();
  });

  test("should answer with code 200 and return empty array", async () => {
    const response = await request(HOST).get("/api/users");

    expect(response.status).toBe(StatusCode.OK);
    expect(response.body).toStrictEqual([]);
  });

  test("should answer with code 200 and return array with 1 user", async () => {
    await request(HOST).post("/api/users").send(user);
    const response = await request(HOST).get("/api/users");

    expect(response.status).toBe(StatusCode.OK);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(expect.objectContaining(user));
  });
});

describe("GET api/users/{userId} tests", () => {
  beforeAll(async () => {
    app = new Server();
    app.use(getRouter(new UserService())).listen(PORT);
  });

  afterAll(() => {
    app.close();
  });

  test("should answer with code 200 and return certain user", async () => {
    const postResponse = await request(HOST).post("/api/users").send(user);
    const returnedUser = postResponse.body as User;

    const response = await request(HOST).get(`/api/users/${returnedUser.id}`);

    expect(response.status).toBe(StatusCode.OK);
    expect(response.body).toStrictEqual(returnedUser);
  });

  test("should answer with code 400 on invalid uuid", async () => {
    const response = await request(HOST).get(`/api/users/123-as-gsd`);

    const error = new ArgumentError();

    expect(response.status).toBe(StatusCode.BadRequest);
    expect(response.status).toBe(error.code);
    expect(response.body).toStrictEqual({ message: error.message });
  });

  test("should answer with code 404 if user doesn't exist", async () => {
    const response = await request(HOST).get(`/api/users/${v4()}`);

    const error = new UserExistingError();

    expect(response.status).toBe(StatusCode.NotFound);
    expect(response.status).toBe(error.code);
    expect(response.body).toStrictEqual({ message: error.message });
  });
});

describe("POST api/users", () => {
  beforeAll(async () => {
    app = new Server();
    app.use(getRouter(new UserService())).listen(PORT);
  });

  afterAll(() => {
    app.close();
  });

  test("should answer with code 201 and return created user", async () => {
    const response = await request(HOST).post("/api/users").send(user);

    expect(response.status).toBe(StatusCode.Created);
    expect(response.body).toEqual(expect.objectContaining(user));
  });

  test("should answer with code 400 if missed mandatory params", async () => {
    const newUser = { username: "asd", age: 22 };
    const response = await request(HOST).post("/api/users").send(newUser);

    const error = new ArgumentError();

    expect(response.status).toBe(StatusCode.BadRequest);
    expect(response.status).toBe(error.code);
    expect(response.body).toStrictEqual({ message: error.message });
  });

  test("should answer with code 500 if passed invalud json", async () => {
    const newUser = '{ username: "asd" age: 22 }';
    const response = await request(HOST).post("/api/users").send(newUser);

    const error = new InternalError();

    expect(response.status).toBe(StatusCode.InternalServerError);
    expect(response.status).toBe(error.code);
    expect(response.body).toStrictEqual({ message: error.message });
  });
});

describe("PUT api/users/{userId} tests", () => {
  beforeAll(async () => {
    app = new Server();
    app.use(getRouter(new UserService())).listen(PORT);
  });

  afterAll(() => {
    app.close();
  });

  const newBody: UserDTO = {
    username: "name",
    age: 22,
    hobbies: ["tea"],
  };

  test("should answer with code 400 if invalid uuid", async () => {
    const response = await request(HOST)
      .put(`/api/users/123-as-gsd`)
      .send(newBody);

    const error = new ArgumentError();

    expect(response.status).toBe(StatusCode.BadRequest);
    expect(response.status).toBe(error.code);
    expect(response.body).toStrictEqual({ message: error.message });
  });

  test("should answer with code 404 if user doesn't exist", async () => {
    const response = await request(HOST)
      .put(`/api/users/${v4()}`)
      .send(newBody);

    const error = new UserExistingError();

    expect(response.status).toBe(StatusCode.NotFound);
    expect(response.status).toBe(error.code);
    expect(response.body).toStrictEqual({ message: error.message });
  });

  test("should answer with code 200 and updated record", async () => {
    const postResponse = await request(HOST).post("/api/users").send(user);
    const returnedUser = postResponse.body as User;

    const response = await request(HOST)
      .put(`/api/users/${returnedUser.id}`)
      .send(newBody);

    expect(response.status).toBe(StatusCode.OK);
    expect(response.body).toStrictEqual({ ...newBody, id: returnedUser.id });
  });
});

describe("DELETE api/users/{userId} tests", () => {
  beforeAll(async () => {
    app = new Server();
    app.use(getRouter(new UserService())).listen(PORT);
  });

  afterAll(() => {
    app.close();
  });

  test("should answer with code 400 if invalid uuid", async () => {
    const response = await request(HOST).delete(`/api/users/123-as-gsd`);
    const error = new ArgumentError();

    expect(response.status).toBe(StatusCode.BadRequest);
    expect(response.status).toBe(error.code);
    expect(response.body).toStrictEqual({ message: error.message });
  });

  test("should answer with code 404 if user doesn't exist", async () => {
    const response = await request(HOST).delete(`/api/users/${v4()}`);
    const error = new UserExistingError();

    expect(response.status).toBe(StatusCode.NotFound);
    expect(response.status).toBe(error.code);
    expect(response.body).toStrictEqual({ message: error.message });
  });

  test("should answer with code 204 if user deletion succeed", async () => {
    const postResponse = await request(HOST).post("/api/users").send(user);
    const returnedUser = postResponse.body as User;

    const response = await request(HOST).delete(
      `/api/users/${returnedUser.id}`
    );

    expect(response.status).toBe(StatusCode.NoContent);
  });
});

describe("shouldn't handle unknown path", () => {
  beforeAll(async () => {
    app = new Server();
    app.use(getRouter(new UserService())).listen(PORT);
  });

  afterAll(() => {
    app.close();
  });

  test("server should answer with status code 404 and corresponding human-friendly message", async () => {
    const response = await request(HOST).get("/users");

    expect(response.statusCode).toBe(StatusCode.NotFound);
    expect(response.body).toStrictEqual({
      message: "There are no such path and method",
    });
  });
});
