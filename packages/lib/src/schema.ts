import type { GenericSchema } from "valibot";

export const required = (kind: string) => `${kind} is required!`;
export const tooLong = (kind: string, max: number) => `${kind} too long (max: ${max})`;
export const tooShort = (kind: string, max: number) => `${kind} too short (min: ${max})`;

export const isValibot = (schema: unknown): schema is GenericSchema =>
  !!schema && typeof schema == "object" && (schema as any).kind === "schema";
