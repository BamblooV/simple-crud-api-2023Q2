import { StatusCode } from "../framework/statusCodes";

export class UserExistingError extends Error {
  message = "User doesn't exist";
  code: StatusCode = StatusCode.NotFound;

  constructor() {
    super();
  }
}
