import { StatusCode } from "../framework/statusCodes";

export class UserExistingError extends Error {
  message: string = "User doesn't exist";
  code: StatusCode = StatusCode.NotFound;

  constructor() {
    super();
  }
}
