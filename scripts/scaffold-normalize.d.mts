export function normalizeScaffoldSource(source: string): string;
export function compareScaffoldSource(current: string, generated: string): "skip" | "conflict";
