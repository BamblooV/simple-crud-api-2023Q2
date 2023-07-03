import { v4 } from "uuid";
import { User, UserDTO } from "../models/User.model";

export default class UserService {
  private users: User[] = [];

  async getUsers() {
    return this.users;
  }

  async getUser(id: string) {
    const user = this.users.find((user) => user.id === id);

    return user;
  }

  async createUser(user: UserDTO) {
    const newUser = {
      id: v4(),
      ...user,
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, patchedUser: UserDTO) {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return;
    }

    this.users[index] = { ...patchedUser, id };

    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const prevLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);

    return prevLength - this.users.length > 0;
  }
}
