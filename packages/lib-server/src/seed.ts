import { seed } from "drizzle-seed";
import { db } from "./pg.ts";
import { connectsTable } from "./connect.ts";

const main = async () => {
  await seed(db, {
    connects: connectsTable,
  }).refine((f) => ({
    connects: {
      columns: {
        email: f.email(),
        message: f.loremIpsum({ sentencesCount: 10 }),
      },
      count: 10,
    },
  }));
};

main();
