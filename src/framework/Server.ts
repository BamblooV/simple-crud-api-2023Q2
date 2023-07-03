import http from "node:http";
import Router, { Matcher, PathHandler, RequestMethod, Route } from "./Router";
import { StatusCode } from "./statusCodes";

export default class Server {
  private routes: Route = {};
  private matchers: Matcher[] = [];
  private server;

  constructor() {
    this.server = http.createServer(async (req, res) => {
      const url = req.url;
      const method = req.method as RequestMethod;

      if (!url || !method) {
        this._handlerNotFound(req, res);
        return;
      }

      const key = method + ":" + url;

      console.log(key);

      let handler: PathHandler = this.routes[key];
      let params: RegExpMatchArray | null = null;

      if (!handler) {
        for (const rx of this.matchers) {
          params = key.match(rx[0]);

          if (params) {
            params.shift();
            handler = rx[1];
            break;
          }
        }
      }

      if (!handler) {
        console.log("don't found handler");

        this._handlerNotFound(req, res);
        return;
      }

      await handler(req, res, params);
      return;
    });
  }

  _handlerNotFound: PathHandler = async (req, res) => {
    res.statusCode = StatusCode.NotFound;
    const value = JSON.stringify({
      message: "There are no such path and method",
    });
    res.end(value);
  };

  listen(port: number, listener?: () => void | undefined) {
    this.server.listen(port, listener);
    return this;
  }

  use(router: Router) {
    Object.assign(this.routes, router.routes);
    this.matchers = this.matchers.concat(router.matchers);
    return this;
  }

  close() {
    this.server.close();
  }
}
