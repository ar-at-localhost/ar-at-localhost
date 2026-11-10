import { mkQuerySv } from "./fetch.svelte";
import { getTestimonialsSrv } from "./testimonial";

export const getTestimonialsQuerySv = mkQuerySv(getTestimonialsSrv);
