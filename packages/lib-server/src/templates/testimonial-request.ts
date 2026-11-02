import { readFile } from "node:fs/promises";

import type { Links } from "lib";
import Mustache from "mustache";

const read = (name: string) => readFile(new URL(name, import.meta.url), "utf8");

/**
 * Get "Testimonial Request" email template
 */
export const getTestimonialRequestTemplate = () => read("testimonial-request.html");
/**
 * Get "Testimonial Request" email template
 */
export const getTestimonialRequestTextTemplate = () =>
  read("./testimonial-request.txt").then((txt) => txt.replace(/<!--[\s\S]*?-->/g, ""));

/**
 * Render "Testimonial Request" email template
 */
export const renderTestimonialRequestTemplate = async (data: {
  first_name: string;
  links?: Links & {
    cta: string;
  };
}) => Mustache.render(await getTestimonialRequestTemplate(), data);

/**
 * Render "Testimonial Request" email template
 */
export const renderTestimonialRequestTextTemplate = async (data: {
  first_name: string;
  links: Links & {
    cta: string;
  };
}) => Mustache.render(await getTestimonialRequestTextTemplate(), data);
