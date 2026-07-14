import { describe, expect, it } from "vitest";
import { compareScaffoldSource, normalizeScaffoldSource } from "../../scripts/scaffold-normalize.mjs";

describe("scaffold source comparison", () => {
  it("同じ内容はskip", () => expect(compareScaffoldSource("const a = 1;", "const a = 1;")).toBe("skip"));
  it("空白と改行差はskip", () => expect(compareScaffoldSource("const  a=\n1;", "const a = 1;")).toBe("skip"));
  it("クォート差はskip", () => expect(normalizeScaffoldSource("import x from 'x'")).toBe(normalizeScaffoldSource('import x from "x"')));
  it("JSX returnの整形括弧差はskip", () => expect(compareScaffoldSource("function A(){return <X/>;}", "function A() { return (<X/>); }")).toBe("skip"));
  it("実質差はconflict", () => expect(compareScaffoldSource("const a = 1;", "const a = 2;")).toBe("conflict"));
});
