import net from "node:net";
import { fork } from "node:child_process";
import path from "node:path";
import UserService from "../services/User.service";
import { DBCommands } from "./commands";
import { UserDTO } from "../models/User.model";
import { DBResponse, DBRequest } from "./types";

if (process.argv.slice(2)[0] === "child") {
  const PORT = parseInt(process.argv.slice(2)[1]) || 8016;

  const service = new UserService();

  const createUser = async (socket: net.Socket, user: UserDTO) => {
    const result = await service.createUser(user);

    const response: DBResponse = {
      ok: true,
      data: result,
    };
    socket.write(JSON.stringify(response));
  };

  const getUser = async (socket: net.Socket, id: string) => {
    const result = await service.getUser(id);

    if (!result) {
      const response: DBResponse = { ok: false, data: null };
      socket.write(JSON.stringify(response));
      return;
    }

    const response: DBResponse = { ok: true, data: result };
    socket.write(JSON.stringify(response));
  };

  const getUsers = async (socket: net.Socket) => {
    const result = await service.getUsers();

    const response: DBResponse = { ok: true, data: result };
    socket.write(JSON.stringify(response));
  };

  const deleteUser = async (socket: net.Socket, id: string) => {
    const result = await service.deleteUser(id);

    const response: DBResponse = { ok: result, data: null };
    socket.write(JSON.stringify(response));
  };

  const updateUser = async (socket: net.Socket, id: string, user: UserDTO) => {
    const result = await service.updateUser(id, user);

    if (!result) {
      const response: DBResponse = { ok: false, data: null };
      socket.write(JSON.stringify(response));
      return;
    }

    const response: DBResponse = { ok: true, data: result };
    socket.write(JSON.stringify(response));
  };

  const server = net.createServer((socket) => {
    socket.on("data", async (data) => {
      const { command, args } = JSON.parse(data.toString()) as DBRequest;

      const { id, user } = args;

      switch (command) {
        case DBCommands.createUser:
          if (!user) {
            return;
          }
          await createUser(socket, user);
          break;

        case DBCommands.getUser:
          if (!id) {
            return;
          }

          await getUser(socket, id);
          break;

        case DBCommands.getUsers:
          await getUsers(socket);
          break;

        case DBCommands.deleteUser:
          if (!id) {
            return;
          }
          await deleteUser(socket, id);
          break;

        case DBCommands.updateUser:
          if (!id || !user) {
            return;
          }
          await updateUser(socket, id, user);
          break;

        default:
          break;
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`DB started on ${PORT}`);
    process.send?.(`DB started on ${PORT}`);
  });
}

const runDB = async (PORT: number) => {
  const processFile = path.join(__filename);
  const dbProcess = fork(processFile, ["child", PORT.toString()]);

  dbProcess.on("message", (msg) => {
    if (msg.toString().startsWith("DB started")) {
      return PORT;
    }
  });
};

export default runDB;
