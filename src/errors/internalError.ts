import { StatusCode } from "../framework/statusCodes";

export class InternalError extends Error {
  message = "Internal server error";
  code: StatusCode = StatusCode.InternalServerError;

  constructor() {
    super();
  }
}
