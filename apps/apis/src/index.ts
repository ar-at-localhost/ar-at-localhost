import { getPort } from "lib";
import { getApp } from "./app.ts";

const port = getPort();
const app = getApp();

app.listen({
  port,
});
