import { describe, expect, it } from "vitest";
import { db, dbm, dbi, mhz, meters, addDb, subDb, addDbi, diffDbm } from "@/lib/rf/units";

describe("RF Brand Units Runtime Behavior", () => {
  describe("constructors", () => {
    it("returns correct values for valid numbers", () => {
      expect(db(10)).toBe(10);
      expect(dbm(20)).toBe(20);
      expect(dbi(3)).toBe(3);
      expect(mhz(920)).toBe(920);
      expect(meters(1.5)).toBe(1.5);
    });

    it("throws error on non-finite values", () => {
      expect(() => db(NaN)).toThrow(TypeError);
      expect(() => db(Infinity)).toThrow(TypeError);
      expect(() => db(-Infinity)).toThrow(TypeError);

      expect(() => dbm(NaN)).toThrow(TypeError);
      expect(() => dbi(NaN)).toThrow(TypeError);
      expect(() => mhz(NaN)).toThrow(TypeError);
      expect(() => meters(NaN)).toThrow(TypeError);
    });
  });

  describe("operators", () => {
    it("addDb adds dB to dBm", () => {
      expect(addDb(dbm(20), db(3))).toBe(23);
    });

    it("subDb subtracts dB from dBm", () => {
      expect(subDb(dbm(20), db(3))).toBe(17);
    });

    it("addDbi adds dB to dBi", () => {
      expect(addDbi(dbi(3), db(2.15))).toBe(5.15);
    });

    it("diffDbm subtracts dBm from dBm to get dB", () => {
      expect(diffDbm(dbm(20), dbm(15))).toBe(5);
    });
  });
});
