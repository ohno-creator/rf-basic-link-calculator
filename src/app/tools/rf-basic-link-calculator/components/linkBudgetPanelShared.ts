import type { LinkBudgetInput } from "@/lib/rf/linkBudget";

export function isHataFamily(model: LinkBudgetInput["propagationModel"]): boolean {
  return model === "okumura_hata" || model === "cost231_hata" || model === "iot_hata_calibrated";
}
