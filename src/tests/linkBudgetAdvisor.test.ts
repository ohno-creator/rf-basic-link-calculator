import { describe, expect, it } from "vitest";
import { calculateLinkBudget, defaultLinkBudgetInput, type LinkBudgetInput } from "@/lib/rf/linkBudget";
import { adviseLinkBudget, solveMaxDistanceM } from "@/lib/rf/linkBudgetAdvisor";

/** 自由空間・付帯損失ゼロの素直な条件（解析解と突き合わせられる）。 */
function freeSpaceInput(overrides: Partial<LinkBudgetInput> = {}): LinkBudgetInput {
  return {
    ...defaultLinkBudgetInput,
    propagationModel: "free_space",
    distance: 100,
    distanceUnit: "m",
    frequencyMHz: 920,
    txPowerDbm: 0,
    txAntennaGainDbi: 0,
    rxAntennaGainDbi: 0,
    cableLossDb: 0,
    environmentLossDb: 0,
    groundProximityLossDb: 0,
    enclosureLossDb: 0,
    polarizationMismatchLossDb: 0,
    vehicleBodyObstructionLossDb: 0,
    installationMarginDb: 0,
    calibrationOffsetDb: 0,
    receiverSensitivityDbm: -100,
    ...overrides
  };
}

describe("solveMaxDistanceM", () => {
  it("自由空間では margin=0 の距離が解析解 d·10^(margin/20) と±1%で一致する", () => {
    const input = freeSpaceInput();
    const result = calculateLinkBudget(input);
    expect(result.linkMarginDb).toBeGreaterThan(0);

    const analytic = 100 * 10 ** (result.linkMarginDb / 20);
    const solved = solveMaxDistanceM(input);
    expect(solved).not.toBeNull();
    expect(Math.abs((solved as number) - analytic) / analytic).toBeLessThan(0.01);
  });

  it("解いた距離で再計算すると margin ≈ 0（±0.15dB）", () => {
    const input = freeSpaceInput({ receiverSensitivityDbm: -90 });
    const solved = solveMaxDistanceM(input);
    expect(solved).not.toBeNull();
    const verified = calculateLinkBudget({
      ...input,
      distance: solved as number,
      distanceUnit: "m"
    });
    expect(Math.abs(verified.linkMarginDb)).toBeLessThan(0.15);
  });

  it("km単位入力でも m で返す", () => {
    const input = freeSpaceInput({ distance: 0.1, distanceUnit: "km" });
    const solved = solveMaxDistanceM(input);
    const solvedFromM = solveMaxDistanceM(freeSpaceInput());
    expect(solved).not.toBeNull();
    expect(Math.abs((solved as number) - (solvedFromM as number))).toBeLessThan(1);
  });

  it("探索上限でも届く強条件では上限値を返す（nullにしない）", () => {
    const input = freeSpaceInput({ txPowerDbm: 30, receiverSensitivityDbm: -130, frequencyMHz: 100 });
    const solved = solveMaxDistanceM(input);
    expect(solved).not.toBeNull();
    expect(solved as number).toBeGreaterThan(10_000);
  });
});

describe("adviseLinkBudget", () => {
  it("マージン不足時: 距離短縮・利得追加・送信電力・環境改善の提案を返す", () => {
    // 100mで届かない厳しい条件（感度-60dBm）＋環境損失10dB
    const input = freeSpaceInput({ receiverSensitivityDbm: -60, environmentLossDb: 10 });
    const result = calculateLinkBudget(input);
    expect(result.linkMarginDb).toBeLessThan(0);
    const deficit = -result.linkMarginDb;

    const advices = adviseLinkBudget(input, result);
    const kinds = advices.map((advice) => advice.kind);
    expect(kinds).toContain("reach_distance");
    expect(kinds).toContain("add_gain");
    expect(kinds).toContain("reduce_environment");

    const gain = advices.find((advice) => advice.kind === "add_gain");
    expect(gain && gain.kind === "add_gain" ? gain.requiredDb : 0).toBeCloseTo(deficit, 1);

    const distance = advices.find((advice) => advice.kind === "reach_distance");
    // 自由空間の解析解: 届く距離 = 現距離×10^(margin/20)
    const analytic = 100 * 10 ** (result.linkMarginDb / 20);
    expect(distance && distance.kind === "reach_distance" ? distance.distanceM : 0).toBeCloseTo(analytic, 0);

    const environment = advices.find((advice) => advice.kind === "reduce_environment");
    expect(environment && environment.kind === "reduce_environment" ? environment.availableDb : 0).toBe(10);
  });

  it("送信電力に上限(30dBm)までの余地がある場合のみ raise_power を返す", () => {
    const weak = freeSpaceInput({ receiverSensitivityDbm: -60, txPowerDbm: 0 });
    const advices = adviseLinkBudget(weak, calculateLinkBudget(weak));
    const power = advices.find((advice) => advice.kind === "raise_power");
    expect(power).toBeDefined();
    if (power && power.kind === "raise_power") {
      expect(power.toDbm).toBeLessThanOrEqual(30);
      expect(power.gainDb).toBeGreaterThan(0);
    }

    const maxed = freeSpaceInput({ receiverSensitivityDbm: -60, txPowerDbm: 30 });
    const advicesMaxed = adviseLinkBudget(maxed, calculateLinkBudget(maxed));
    expect(advicesMaxed.find((advice) => advice.kind === "raise_power")).toBeUndefined();
  });

  it("マージン十分時: headroom（余裕dBと伸ばせる距離）だけを返す", () => {
    const input = freeSpaceInput();
    const result = calculateLinkBudget(input);
    expect(result.linkMarginDb).toBeGreaterThan(0);

    const advices = adviseLinkBudget(input, result);
    expect(advices).toHaveLength(1);
    const headroom = advices[0];
    expect(headroom.kind).toBe("headroom");
    if (headroom.kind === "headroom") {
      expect(headroom.extraDb).toBeCloseTo(result.linkMarginDb, 6);
      const analytic = 100 * 10 ** (result.linkMarginDb / 20);
      expect(Math.abs(headroom.distanceM - analytic) / analytic).toBeLessThan(0.01);
    }
  });
});
