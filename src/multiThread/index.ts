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

    const balancer = http.createServer((balancerRequest, balancerResponse) => {
      console.log(
        `Request ${balancerRequest.method}: ${balancerRequest.url} to Load Balancer`
      );

      workerPointer = (workerPointer + 1) % availableCPUS;
      const workerPort = workerPorts[workerPointer];

      try {
        const workerRequest = http.request(
          {
            hostname: "localhost",
            port: workerPort,
            path: balancerRequest.url,
            method: balancerRequest.method,
            headers: balancerRequest.headers,
          },
          (workerResponse) => {
            balancerResponse.writeHead(
              workerResponse.statusCode ?? 200,
              workerResponse.statusMessage,
              workerResponse.headers
            );
            workerResponse.pipe(balancerResponse);
          }
        );
        workerRequest.on("error", (error) => {
          console.error(error.message);
          balancerResponse.setHeader("Content-Type", "application/json");
          balancerResponse.statusCode = StatusCode.InternalServerError;
          balancerResponse.end(
            JSON.stringify({ message: "Internal node error occured" })
          );
          balancerRequest.unpipe(workerRequest);
        });

        console.log(`Forward request to worker on port ${workerPort}`);

        balancerRequest.pipe(workerRequest);
      } catch (error) {
        balancerResponse.setHeader("Content-Type", "application/json");
        balancerResponse.statusCode = StatusCode.InternalServerError;
        balancerResponse.end(
          JSON.stringify({ message: "Internal node error occured" })
        );
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
