import { mkQuerySv } from "./fetch.svelte";
import { getTestimonialReqsSrv, getTestimonialsSrv } from "./testimonial";

export const getTestimonialsQuerySv = mkQuerySv(getTestimonialsSrv);
export const getTestimonialReqsQuerySv = mkQuerySv(getTestimonialReqsSrv);
