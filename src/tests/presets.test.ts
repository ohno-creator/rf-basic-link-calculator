import { describe, expect, it } from "vitest";
import { COLUMN_URL, CONTACT_URL, TOOL_URL } from "@/lib/rf/presets";

describe("RF page URL presets", () => {
  it("keeps the production contact, column, and tool URLs", () => {
    expect(CONTACT_URL).toBe("https://www.staf.co.jp/contact.html");
    expect(COLUMN_URL).toBe("https://www.staf.co.jp/media/");
    expect(TOOL_URL).toBe("https://www.staf.co.jp/tools/rf-basic-link-calculator");
  });
});
