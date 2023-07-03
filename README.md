# Node.js CRUD API

A simple Node.js server with an in-memory database that can handle GET, POST, PUT and DELETE requests

To run the application, you will need Node.js version 18.16.1 or higher with the npm package manager and the Git version control system. Download and install them from the links

## 1. Preparing application files

Clone this repository with the command:

```
git clone https://github.com/BamblooV/simple-crud-api-2023Q2.git
```

or via ssh:

```
git clone git@github.com:BamblooV/simple-crud-api-2023Q2.git
```

Navigate to the newly created folder:

```
cd simple-crud-api-2023Q2
```

Install the dependencies with the command:

```
npm i
```

In the root folder of the application, create a text file called .env, write the environment variable PORT in it with the value of a convenient port for starting the application.

## 2. Application launch

For convenience, the application has a number of scripts to run or build in different modes

Сommand

```
npm run start:prod
```

starts the build process and then runs the bundled file

Command

```
npm run start:dev
```

runs the application in development mode without horizontal scaling. In this mode, you can make changes to the application code, it will automatically restart when you save changes

There are two commands to run the application in horizontal scaling modes:

```
start:multi
```

runs the application in development mode

```
start:prod:multi
```

starts the build process and then runs the bundled file

In these modes, the application starts additional processes, one less than the number of logical processor cores on the computer it is running on, to process incoming requests in parallel.

To exit the application, press CTRL+C on the keyboard and confirm the exit, or simply close the command line in which the application is running

## 3. Working with the application

It is recommended to use Postman to send requests

Application only supports `GET`, `POST`, `PUT` and `DELETE` request methods

Users in the database are stored as objects:

```typescript
{
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}
```

The user id is immutable and is generated on the server when the user is created. The remaining fields are MANDATORY to pass in requests if the request must contain a body.

On a GET request to `http://localhost:${YOUR_PORT}/api/users` the application returns a list of all users in JSON format.

On a GET request to `http://localhost:${YOUR_PORT}/api/users/${SOME_USER_ID}` the application returns the user with the passed id === SOME_USER_ID. If a user with this id is not found, then the application responds with a `404` status.

A POST request to `http://localhost:${YOUR_PORT}/api/users` with a body containing all required fields creates a new user record in the database. It is assigned a unique id. The application responds with a newly created user record.

When a PUT request to `http://localhost:${YOUR_PORT}/api/users/${SOME_USER_ID}` with a body containing all required fields, the data of the previously created user is overwritten in the database. The user id does not change. If a user with this id is not found, then the application responds with a `404` status.

A DELETE request to `http://localhost:${YOUR_PORT}/api/users/${SOME_USER_ID}` removes the user record with id === SOME_USER_ID from the database. If a user with this id is not found, then the application responds with a `404` status.

The application responds with a 400 status to requests with other methods, requests to non-existent url addresses, requests with invalid id or body containing not all required fields. The application is implemented in such a way that the values of the required fields are not checked in any way other than against the expected type. Therefore, empty strings in names, negative ages, etc. are all valid. The application ignores any extra fields in POST and PUT requests and does not save them in any way.

4. Running tests
   Command

```
npm run test
```

runs application tests
