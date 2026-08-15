import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = new URL("../contracts/openapi.yaml", import.meta.url);
const targetDirectory = new URL("../backend/contracts/", import.meta.url);
const target = new URL("openapi.yaml", targetDirectory);
const hashTarget = new URL("openapi.sha256", targetDirectory);
const contents = await readFile(source);
const hash = createHash("sha256").update(contents).digest("hex");

await mkdir(targetDirectory, { recursive: true });
await writeFile(target, contents);
await writeFile(hashTarget, `${hash}\n`, "utf8");
