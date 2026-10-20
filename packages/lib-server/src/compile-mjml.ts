import { dirname, join } from "node:path";
import { testDirectory } from "./fs.ts";
import { readFile, writeFile } from "node:fs/promises";
import { globby } from "globby";
import mjml from "mjml";

const main = async () => {
  const dir = join(dirname(import.meta.url.replace("file:/", "")), "templates");
  const src = dir;
  const out = dir;
  await testDirectory(src, { abort: true });
  if (src != out) await testDirectory(out, { abort: true, create: true });
  console.log(`MJML Compiler\n> Source Directory: ${src}\n> Out Directory: ${out}`);

  const sourceFiles = await globby(`${src}/**/*.mjml`);
  for (const srcFile of sourceFiles) {
    const outFile = srcFile.replace(src, out).replace(".mjml", ".html");
    console.log(`>`.repeat(80));
    console.log(`==> ${srcFile}`);
    console.log(`<== ${outFile}`);
    const source = await readFile(srcFile, "utf8");

    const result = await mjml(source, {
      preprocessors: [
        (v: string) => v.replace(/\{\{[#^/][^}]+\}\}/g, (tag) => `<mj-raw>${tag}</mj-raw>`),
      ],
    });

    if (result.errors?.length)
      console.error(result.errors.map((i) => i.formattedMessage).join("\n"));

    if (result.html) {
      await testDirectory(dirname(outFile), { create: true, abort: true });
      await writeFile(outFile, result.html);
    }

    console.log(`<`.repeat(80));
  }
};

main();
