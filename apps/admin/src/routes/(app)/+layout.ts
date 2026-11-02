import { redirect } from "@sveltejs/kit";

import { getToken } from "#lib/auth.ts";

export const load = () => {
  if (!getToken()) {
    return redirect(307, "/auth/login");
  }
};
