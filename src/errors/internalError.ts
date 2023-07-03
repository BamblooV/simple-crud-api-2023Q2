import { StatusCode } from "../framework/statusCodes";

export class InternalError extends Error {
  message: string = "Internal server error";
  code: StatusCode = StatusCode.InternalServerError;

  constructor() {
    super();
  }
}
