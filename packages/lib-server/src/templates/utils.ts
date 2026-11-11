export const stripFrontmatter = (txt: string) => txt.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
