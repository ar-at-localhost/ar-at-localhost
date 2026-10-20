import { mkdir, stat } from "fs/promises";

/**
 * Test a directory for existance. Optionally Abort the program if test fails.
 */
export const testDirectory = async (
  dir: string,
  opts?: {
    abort?: boolean;
    create?: boolean;
  },
) => {
  if (opts?.create) await mkdir(dir, { recursive: true }).catch(() => null);

  const srcStat = await stat(dir, {
    throwIfNoEntry: false,
  }).catch(() => null);

  if (!srcStat?.isDirectory()) {
    const error = Error(`Path ${dir} doesn't exits or is not a valid directory.`);
    if (opts?.abort) {
      console.error(error.message);
      process.exit(137);
    }

    throw error;
  }
};
