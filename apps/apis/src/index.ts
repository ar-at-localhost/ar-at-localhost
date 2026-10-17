import { getHost, getPort } from "lib";
import { getApp } from "./app.ts";

const host = getHost();
const port = getPort();
const app = getApp(!!process.env.SSL_CERT_PATH!);

app.listen({
  host,
  port,
});
