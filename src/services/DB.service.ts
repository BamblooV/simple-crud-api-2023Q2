import { DBCommands } from "../db/commands";
import { DBRequest, DBResponse } from "../db/types";
import { User, UserDTO } from "../models/User.model";
import { UserCRUDService } from "./User.service";
import net, { Socket } from "node:net";

export class DBService implements UserCRUDService {
  #socket: net.Socket = new Socket();

  async connect(PORT: number) {
    this.#socket.connect(PORT, () => {
      console.log("server connected to db");
    });

    this.#socket.on("error", (error) => {
      console.log(error);
    });
  }

  getUsers() {
    return new Promise<User[]>((res, rej) => {
      this.#socket.once("data", (msg) => {
        const response = JSON.parse(msg.toString()) as DBResponse;

        const { data } = response;
        if (Array.isArray(data)) {
          res(data);
          return;
        }

        rej();
      });

      const request: DBRequest = {
        command: DBCommands.getUsers,
        args: {},
      };

      const stringifyedRequest = JSON.stringify(request);

      this.#socket.write(stringifyedRequest);
    });
  }

  getUser(id: string) {
    return new Promise<User | undefined>((res, rej) => {
      this.#socket.once("data", (msg) => {
        const response = JSON.parse(msg.toString()) as DBResponse;

        const { data } = response;

        if (Array.isArray(data)) {
          rej();
          return;
        }

        if (!data) {
          res(undefined);
          return;
        }

        res(data);
      });

      const request: DBRequest = {
        command: DBCommands.getUser,
        args: {
          id,
        },
      };

      const stringifyedRequest = JSON.stringify(request);

      this.#socket.write(stringifyedRequest);
    });
  }

  createUser(user: UserDTO) {
    return new Promise<User>((res, rej) => {
      this.#socket.once("data", (msg) => {
        const response = JSON.parse(msg.toString()) as DBResponse;

        const { data } = response;

        if (Array.isArray(data) || !data) {
          rej();
          return;
        }

        res(data);
      });

      const request: DBRequest = {
        command: DBCommands.createUser,
        args: {
          user,
        },
      };

      const stringifyedRequest = JSON.stringify(request);

      this.#socket.write(stringifyedRequest);
    });
  }

  updateUser(id: string, patchedUser: UserDTO) {
    return new Promise<User | undefined>((res, rej) => {
      this.#socket.once("data", (msg) => {
        const response = JSON.parse(msg.toString()) as DBResponse;

        const { data } = response;

        if (Array.isArray(data)) {
          rej();
          return;
        }

        if (!data) {
          res(undefined);
          return;
        }

        res(data);
      });

      const request: DBRequest = {
        command: DBCommands.updateUser,
        args: {
          user: patchedUser,
          id,
        },
      };

      const stringifyedRequest = JSON.stringify(request);

      this.#socket.write(stringifyedRequest);
    });
  }
  deleteUser(id: string) {
    return new Promise<boolean>((res, rej) => {
      this.#socket.once("data", (msg) => {
        const response = JSON.parse(msg.toString()) as DBResponse;

        const { ok } = response;

        res(ok);
      });

      const request: DBRequest = {
        command: DBCommands.deleteUser,
        args: {
          id,
        },
      };

      const stringifyedRequest = JSON.stringify(request);

      this.#socket.write(stringifyedRequest);
    });
  }
}
