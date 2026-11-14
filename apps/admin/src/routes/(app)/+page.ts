import { redirect } from "@sveltejs/kit";

import { loadProfile } from "#lib";

export const load = async () => {
  const profile = await loadProfile();

  if (!profile) {
    redirect(307, "/auth/login");
  }

  return profile;
};
