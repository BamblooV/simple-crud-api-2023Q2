import { validate } from "uuid";

import { ArgumentError, InternalError, UserExistingError } from "../errors";
import { UserDTO } from "../models/User.model";
import { UserCRUDService } from "../services/User.service";

export class UserController {
  constructor(private service: UserCRUDService) {}

  private isValidParams(user: UserDTO): boolean {
    const { username, age, hobbies } = user;
    if (
      typeof username === "string" &&
      Boolean(username) &&
      typeof age === "number" &&
      age >= 0 &&
      Array.isArray(hobbies) &&
      hobbies.every((elem) => typeof elem === "string")
    ) {
      return true;
    }

    return false;
  }

  async getUsers() {
    try {
      const users = await this.service.getUsers();
      return users;
    } catch (error) {
      throw new InternalError();
    }
  }

  async getUser(id: string) {
    if (validate(id)) {
      try {
        const user = await this.service.getUser(id);

        if (!user) {
          throw new UserExistingError();
        }

        return user;
      } catch (error) {
        if (error instanceof UserExistingError) {
          throw error;
        }
        throw new InternalError();
      }
    } else {
      throw new ArgumentError();
    }
  }

  async createUser(user: UserDTO) {
    if (this.isValidParams(user)) {
      try {
        const newUser = await this.service.createUser(user);
        return newUser;
      } catch (error) {
        throw new InternalError();
      }
    } else {
      throw new ArgumentError();
    }
  }

  async updateUser(id: string, user: UserDTO) {
    if (validate(id) && this.isValidParams(user)) {
      try {
        const patchedUser = await this.service.updateUser(id, user);

        if (!patchedUser) {
          throw new UserExistingError();
        }

        return patchedUser;
      } catch (error) {
        if (error instanceof UserExistingError) {
          throw error;
        }
        throw new InternalError();
      }
    } else {
      throw new ArgumentError();
    }
  }

  async deleteUser(id: string) {
    if (validate(id)) {
      try {
        const isSucceseed = await this.service.deleteUser(id);

        if (!isSucceseed) {
          throw new UserExistingError();
        }

        return isSucceseed;
      } catch (error) {
        if (error instanceof UserExistingError) {
          throw error;
        }
        throw new InternalError();
      }
    } else {
      throw new ArgumentError();
    }
  }
}
