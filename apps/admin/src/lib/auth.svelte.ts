import type { UserProfile } from "./auth";

export const user: { profile: UserProfile | null } = $state({
  profile: null,
});
