import { UserDTO, User } from "../models/User.model";
import { DBCommands } from "./commands";

export type DBRequest = {
  command: DBCommands;
  args: {
    id?: string;
    user?: UserDTO;
  };
};

export type DBResponse = {
  ok: boolean;
  data: User[] | User | null;
};
