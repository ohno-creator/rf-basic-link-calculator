import { execFileSync } from "node:child_process";

export function loadTools() {
  const expression = 'import { tools } from "./src/data/tools.ts"; process.stdout.write(JSON.stringify(tools));';
  return JSON.parse(execFileSync("npx", ["tsx", "-e", expression], { encoding: "utf8" }));
}
