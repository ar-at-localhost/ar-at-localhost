export const required = (kind: string) => `${kind} is required!`;
export const tooLong = (kind: string, max: number) => `${kind} too long (max: ${max})`;
export const tooShort = (kind: string, max: number) => `${kind} too short (min: ${max})`;
