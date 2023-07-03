import http from "node:http";
import Router, { Matcher, PathHandler, RequestMethod, Route } from "./Router";
import { StatusCode } from "./statusCodes";

export default class Server {
  _routes: Route = {};
  _matchers: Matcher[] = [];
  _server;

  constructor() {
    this._server = http.createServer(async (req, res) => {
      const url = req.url;
      const method = req.method as RequestMethod;

      if (!url || !method) {
        this._handlerNotFound(req, res);
        return;
      }

      const key = method + ":" + url;

      let handler: PathHandler = this._routes[key];
      let params: RegExpMatchArray | null = null;

      if (!handler) {
        for (const rx of this._matchers) {
          params = key.match(rx[0]);

          if (params) {
            params.shift();
            handler = rx[1];
            break;
          }
        }
      }

      if (!handler) {
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

  listen(port: number, listener: () => void | undefined): void {
    this._server.listen(port, listener);
  }

  use(router: Router): void {
    Object.assign(this._routes, router.routes);
    this._matchers = this._matchers.concat(router.matchers);
  }
}