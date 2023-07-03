import http from "node:http";

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type Route = {
  [methodPath: string]: PathHandler;
};

export type Matcher = [RegExp, PathHandler];

export type PathHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  },
  args?: RegExpMatchArray | null
) => Promise<void>;

export default class Router {
  #routes: Route = {};
  #matchers: Matcher[] = [];

  constructor() {}

  addHandler(path: string, method: RequestMethod, listener: PathHandler) {
    let normalizedPath = path.startsWith("/") ? path : "/" + path;
    const key = method + ":" + normalizedPath;
    if (normalizedPath.includes("*")) {
      const rx = new RegExp(key.replace("*", "(.*)"));
      const matcher: Matcher = [rx, listener];
      this.#matchers.push(matcher);
    } else {
      this.#routes[key] = listener;
    }
  }

  get routes() {
    return this.#routes;
  }

  get matchers() {
    return this.#matchers;
  }

  get(path: string, listener: PathHandler) {
    this.addHandler(path, RequestMethod.GET, listener);
  }

  post(path: string, listener: PathHandler) {
    this.addHandler(path, RequestMethod.POST, listener);
  }

  put(path: string, listener: PathHandler) {
    this.addHandler(path, RequestMethod.PUT, listener);
  }

  delete(path: string, listener: PathHandler) {
    this.addHandler(path, RequestMethod.DELETE, listener);
  }
}
