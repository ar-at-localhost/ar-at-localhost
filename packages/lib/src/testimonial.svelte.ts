import { mkMutationSv, mkQuerySv } from "./fetch.svelte";
import { createTestimonialReqSrv, getTestimonialReqsSrv, getTestimonialsSrv } from "./testimonial";

export const getTestimonialsQuerySv = mkQuerySv(getTestimonialsSrv);
export const getTestimonialReqsQuerySv = mkQuerySv(getTestimonialReqsSrv);
export const createTestimonialReqMutationSv = mkMutationSv(createTestimonialReqSrv);
