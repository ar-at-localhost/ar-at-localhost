import { getHost, getPort } from "lib";
import { createApp } from "./app.ts";

const host = getHost();
const port = getPort();

createApp({
  dontAwaitDatabase: true,
  name: "contact",
}).then((app) => {
  app.listen({
    host,
    port,
  });
});
