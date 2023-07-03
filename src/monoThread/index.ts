import Server from "../framework/Server";
import getRouter from "./routes";

import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "8000");

const app = new Server();

app.use(getRouter()).listen(PORT, () => {
  console.log(`server started on ${PORT}`);
});
