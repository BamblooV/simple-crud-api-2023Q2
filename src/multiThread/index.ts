import os from "node:os";
import cluster from "node:cluster";
import http from "node:http";

import dotenv from "dotenv";
import Server from "../framework/Server";
import getRouter from "../routes/routes";
import { DBService } from "../services/DB.service";
import { StatusCode } from "../framework/statusCodes";
import runDB from "../db/userDB";

dotenv.config();

const availableCPUS = os.availableParallelism() - 1;

const PORT = parseInt(process.env.PORT ?? "8000");
const DB_PORT = PORT + availableCPUS + 1;

const startMulti = async () => {
  if (cluster.isPrimary) {
    await runDB(DB_PORT);

    const workerPorts: number[] = [];

    for (let i = 0; i < availableCPUS; i++) {
      const workerPort = PORT + 1 + i;

      setTimeout(() => {
        cluster.fork({ WORKER_PORT: workerPort, DB_PORT });
        workerPorts.push(workerPort);
      }, i * 500);
    }

    let workerPointer = 0;

    const balancer = http.createServer((req, res) => {
      console.log(`Request ${req.method}: ${req.url} to Load Balancer`);

      workerPointer = (workerPointer + 1) % availableCPUS;
      const workerPort = workerPorts[workerPointer];

      try {
        const connector = http.request(
          {
            hostname: "localhost",
            port: workerPort,
            path: req.url,
            method: req.method,
            headers: req.headers,
          },
          (resp) => {
            res.writeHead(
              resp.statusCode ?? 200,
              resp.statusMessage,
              resp.headers
            );
            resp.pipe(res);
          }
        );
        connector.on("error", (error) => {
          console.error(error.message);
          res.setHeader("Content-Type", "application/json");
          res.statusCode = StatusCode.InternalServerError;
          res.end(JSON.stringify({ message: "Internal node error occured" }));
          req.unpipe(connector);
        });

        console.log(`Forward request to worker on port ${workerPort}`);

        req.pipe(connector);
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = StatusCode.InternalServerError;
        res.end(JSON.stringify({ message: "Internal node error occured" }));
      }
    });

    balancer
      .listen(PORT, () => {
        console.log(`Balancer listen ${PORT}`);
      })
      .on("error", () => {
        process.exit(0);
      });
  }

  if (cluster.isWorker) {
    const port: number = parseInt(process.env.WORKER_PORT ?? "8001");
    const DB_PORT = parseInt(process.env.WORKER_PORT ?? "8016");
    const app = new Server();
    const service = new DBService();
    const routes = getRouter(service);
    app.use(routes).listen(port, () => {
      console.log(`Cluster fork started at ${port}`);
    });
    await service.connect(DB_PORT);
  }
};

startMulti();
