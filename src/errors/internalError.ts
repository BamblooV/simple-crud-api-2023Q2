import { StatusCode } from "../framework/statusCodes";

export class InternalError extends Error {
  message = "Internal node error occured";
  code: StatusCode = StatusCode.InternalServerError;

  constructor() {
    super();
  }
}
