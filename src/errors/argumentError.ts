import { StatusCode } from "../framework/statusCodes";

export class ArgumentError extends Error {
  message: string = "Wrong request params";
  code: StatusCode = StatusCode.BadRequest;

  constructor() {
    super();
  }
}
