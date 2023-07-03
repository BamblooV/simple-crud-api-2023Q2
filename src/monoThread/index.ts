import Server from "../framework/Server";
import router from "./routes";

const app = new Server();

app.use(router);

app.listen(8000, () => {
  console.log("server started on 8000");
});
