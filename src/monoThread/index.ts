import Server from "../framework/Server";
import UserService from "../services/User.service";
import getRouter from "../routes/routes";

import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "8000");

const app = new Server();

const service = new UserService();

const routes = getRouter(service);

app.use(routes).listen(PORT, () => {
  console.log(`server started on ${PORT}`);
});
