import Router from "../framework/Router";
import { UserController } from "../controllers/User.controller";
import UserService from "../services/User.service";
import { StatusCode } from "../framework/statusCodes";
import { ArgumentError } from "../errors";
import { UserDTO } from "../models/User.model";

const router = new Router();
const controller = new UserController(new UserService());

router.get("api/users", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const data = await controller.getUsers();

    res.statusCode = StatusCode.OK;

    res.end(JSON.stringify(data));
  } catch (error: any) {
    res.statusCode = error.code;
    res.end(JSON.stringify({ message: error.message }));
  }
});

router.get("api/users/*", async (req, res, args) => {
  res.setHeader("Content-Type", "application/json");

  try {
    if (!args) {
      throw new ArgumentError();
    }
    const id = args[0];
    const data = await controller.getUser(id);

    res.statusCode = StatusCode.OK;

    res.end(JSON.stringify(data));
  } catch (error: any) {
    res.statusCode = error.code;
    res.end(JSON.stringify({ message: error.message }));
  }
});

router.post("api/users", async (req, res) => {
  const data: string[] = [];

  req.on("data", (chunk) => {
    data.push(chunk);
  });

  req.on("end", async () => {
    res.setHeader("Content-Type", "application/json");

    try {
      const userDTO = JSON.parse(data.join()) as UserDTO;
      const newUser = await controller.createUser(userDTO);

      res.statusCode = StatusCode.Created;
      res.end(JSON.stringify(newUser));
    } catch (error: any) {
      if (error.code) {
        res.statusCode = error.code;
        res.end(JSON.stringify({ message: error.message }));
      } else {
        res.statusCode = StatusCode.InternalServerError;
        res.end(JSON.stringify({ message: "Internal node error occured" }));
      }
    }
  });
});

router.put("api/users/*", async (req, res, args) => {
  const data: string[] = [];

  req.on("data", (chunk) => {
    data.push(chunk);
  });

  req.on("end", async () => {
    res.setHeader("Content-Type", "application/json");

    try {
      const userDTO = JSON.parse(data.join()) as UserDTO;

      if (!args) {
        throw new ArgumentError();
      }
      const id = args[0];

      const updatedUser = await controller.updateUser(id, userDTO);

      res.statusCode = StatusCode.Created;
      res.end(JSON.stringify(updatedUser));
    } catch (error: any) {
      if (error.code) {
        res.statusCode = error.code;
        res.end(JSON.stringify({ message: error.message }));
      } else {
        res.statusCode = StatusCode.InternalServerError;
        res.end(JSON.stringify({ message: "Internal node error occured" }));
      }
    }
  });
});

router.delete("api/users/*", async (req, res, args) => {
  try {
    if (!args) {
      throw new ArgumentError();
    }
    const id = args[0];
    await controller.deleteUser(id);

    res.statusCode = StatusCode.NoContent;
    res.end();
  } catch (error: any) {
    res.statusCode = error.code;
    res.end(JSON.stringify({ message: error.message }));
  }
});

export default router;
