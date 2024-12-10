"use strict";

const { readFile, readdir, writeFile } = require("fs").promises;
const { join } = require("path");

const replacements = ["  ", "\n"];
const regex = /\t|\x0D\x0A/g;
const replacer = (match) => replacements[match.length - 1];

async function main() {
  const dist = join(__dirname, "dist");
  const dirents = await readdir(join(__dirname, "dist"), {
    withFileTypes: true,
  });

  for (const dirent of dirents) {
    if (dirent.isFile()) {
      const file = join(dist, dirent.name);
      const content = (await readFile(file, "utf8")).replace(regex, replacer);
      await writeFile(file, content);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
