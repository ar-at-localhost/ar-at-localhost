import { generateSwagger } from "lib-server";
import { createApp } from "./app.ts";

const main = async () => {
  const app = await createApp({
    noDatabase: true,
  });
  await generateSwagger(app);
};

main();
