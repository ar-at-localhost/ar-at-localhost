import { redirect } from "@sveltejs/kit";

export const load = () => {
  return redirect(307, "/testimonials/received");
};
