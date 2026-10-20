import Mustache from "mustache";
import { readFile } from "node:fs/promises";

const read = (name: string) => readFile(new URL(name, import.meta.url), "utf8");

/**
 * Get "Connect" email template
 */
export const getConnectTemplate = () => read("connect.html");
/**
 * Get "Connect" email template
 */
export const getConnectTextTemplate = () =>
  read("./connect.txt").then((txt) => txt.replace(/<!--[\s\S]*?-->/g, ""));

/**
 * Render "Connect" email template
 */
export const renderConnectTemplate = async (data: {
  firstName: string;
  links?: {
    whatsapp?: string;
    linkedin?: string;
    upwork?: string;
    fiverr?: string;
  };
}) => Mustache.render(await getConnectTemplate(), data);

/**
 * Render "Connect" email template
 */
export const renderConnectTextTemplate = async (data: {
  firstName: string;
  links?: {
    whatsapp?: string;
    linkedin?: string;
    upwork?: string;
    fiverr?: string;
  };
}) => Mustache.render(await getConnectTextTemplate(), data);
