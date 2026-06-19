import { describe, expect, it } from "vitest";
import { defaultLinkBudgetInput, type LinkBudgetInput } from "@/lib/rf/linkBudget";
import {
  buildShareUrl,
  decodeInputFromQuery,
  encodeInputToQuery,
  isDefaultInput,
  sanitizeInput
} from "@/lib/rf/share";

const sample: LinkBudgetInput = {
  system: "LoRa / LoRaWAN",
  linkType: "gateway_to_low_height_terminal",
  propagationModel: "free_space",
  pathLossExponent: 3.2,
  frequencyMHz: 920,
  distance: 1.5,
  distanceUnit: "km",
  txPowerDbm: 13,
  txAntennaGainDbi: 0,
  rxAntennaGainDbi: 2,
  txAntennaHeightM: 8,
  rxAntennaHeightM: 1.5,
  cableLossDb: 1,
  environmentLossDb: 10,
  groundProximityLossDb: 2,
  enclosureLossDb: 3,
  polarizationMismatchLossDb: 1,
  vehicleBodyObstructionLossDb: 0,
  installationMarginDb: 2,
  calibrationOffsetDb: -1,
  receiverSensitivityDbm: -120
};

describe("share encode/decode", () => {
  it("round-trips an input through the query string", () => {
    const query = encodeInputToQuery(sample);
    const decoded = decodeInputFromQuery(query);

    expect(decoded).toEqual(sample);
  });

  it("returns null when the query has no shared keys", () => {
    expect(decodeInputFromQuery("")).toBeNull();
    expect(decodeInputFromQuery("?utm_source=mail&foo=bar")).toBeNull();
  });

  it("falls back to defaults for malformed values", () => {
    const decoded = decodeInputFromQuery("f=abc&d=&du=miles&sys=&tx=NaN");

    expect(decoded?.frequencyMHz).toBe(defaultLinkBudgetInput.frequencyMHz);
    expect(decoded?.distance).toBe(defaultLinkBudgetInput.distance);
    expect(decoded?.distanceUnit).toBe(defaultLinkBudgetInput.distanceUnit);
    expect(decoded?.system).toBe(defaultLinkBudgetInput.system);
    expect(decoded?.linkType).toBe(defaultLinkBudgetInput.linkType);
    expect(decoded?.propagationModel).toBe(defaultLinkBudgetInput.propagationModel);
    expect(decoded?.pathLossExponent).toBe(defaultLinkBudgetInput.pathLossExponent);
    expect(decoded?.txPowerDbm).toBe(defaultLinkBudgetInput.txPowerDbm);
  });

  it("keeps preserved fields while sanitizing invalid ones", () => {
    const sanitized = sanitizeInput({
      system: "Wi-Fi",
      frequencyMHz: 2400,
      distance: Number.NaN,
      distanceUnit: "km",
      txPowerDbm: "15",
      linkType: "terminal_to_terminal",
      propagationModel: "two_ray",
      pathLossExponent: "2.7",
      receiverSensitivityDbm: -75
    });

    expect(sanitized.system).toBe("Wi-Fi");
    expect(sanitized.linkType).toBe("terminal_to_terminal");
    expect(sanitized.propagationModel).toBe("two_ray");
    expect(sanitized.pathLossExponent).toBe(2.7);
    expect(sanitized.frequencyMHz).toBe(2400);
    expect(sanitized.distance).toBe(defaultLinkBudgetInput.distance);
    expect(sanitized.txPowerDbm).toBe(15);
    expect(sanitized.receiverSensitivityDbm).toBe(-75);
  });
});

describe("isDefaultInput", () => {
  it("is true for the default input and false once a field changes", () => {
    expect(isDefaultInput(defaultLinkBudgetInput)).toBe(true);
    expect(isDefaultInput({ ...defaultLinkBudgetInput, distance: 2 })).toBe(false);
    expect(isDefaultInput(sample)).toBe(false);
  });
});

describe("buildShareUrl", () => {
  it("appends the query to the path and replaces any existing query", () => {
    const url = buildShareUrl(sample, "https://example.com/tools/rf-basic-link-calculator/?old=1");

    expect(url.startsWith("https://example.com/tools/rf-basic-link-calculator/?")).toBe(true);
    expect(url).not.toContain("old=1");

    const decoded = decodeInputFromQuery(url.split("?")[1]);
    expect(decoded).toEqual(sample);
  });
});
