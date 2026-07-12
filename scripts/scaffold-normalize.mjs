export function normalizeScaffoldSource(source) {
  return source
    .replace(/\r\n/g, "\n")
    .replace(/["']/g, '"')
    .replace(/\s+/g, "")
    .replace(/return\(/g, "return")
    .replace(/\);}/g, ";}")
    .trim();
}

export function compareScaffoldSource(current, generated) {
  return normalizeScaffoldSource(current) === normalizeScaffoldSource(generated) ? "skip" : "conflict";
}
