import type { UserInfo } from "lib";

import { db } from "./pg.ts";

export const getUserInfo = async (id: number): Promise<UserInfo> => {
  const result: UserInfo = await db.query.usersTable
    .findFirst({
      where: {
        id,
      },
      with: {
        keys: true,
        handles: true,
      },
    })
    .then((res) => JSON.parse(JSON.stringify(res)) as unknown as UserInfo);

  return result;
};
