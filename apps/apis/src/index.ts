import { getHost, getPort } from "lib";
import { getApp } from "./app.ts";

const host = getHost();
const port = getPort();
const app = getApp();

app.listen({
  host,
  port,
});
