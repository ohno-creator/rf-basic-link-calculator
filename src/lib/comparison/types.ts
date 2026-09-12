// ケーブル・位置比較 v2 の契約。未知と数値ゼロを区別する。
export type Unit = 'm' | 'MHz' | 'dB' | 'dB/m' | 'dBm';
export type Evidence = {
  kind: 'assumption' | 'datasheet' | 'measurement';
  origin: 'example' | 'user' | 'approved-catalog';
  sourceLabel: string; conditions: string;
  sourceRef?: { id: string; revision: string };
  derivation: 'direct' | 'linear-interpolation';
};
export type Applicability =
  | { kind: 'frequency-independent' }
  | { kind: 'at-frequency'; frequencyMHz: number }
  | { kind: 'within-range'; minMHz: number; maxMHz: number }
  | { kind: 'unconfirmed'; reason: string };
export type Quantity<U extends Unit = Unit> =
  | { kind: 'known'; value: number; unit: U; evidence: Evidence; applicability: Applicability }
  | { kind: 'unknown'; unit: U; reason: string };
export type ConditionState = 'confirmed' | 'assumed' | 'unknown' | 'mismatch';
export const conditionKeys = ['device-and-settings', 'counterparty', 'other-configuration', 'measurement-method', 'environment'] as const;
export type ConditionKey = typeof conditionKeys[number];
export type ConditionCheck = { key: ConditionKey; state: ConditionState; note: string };
export type Context = { frequencyMHz: Quantity<'MHz'>; checks: ConditionCheck[]; scope: 'passive-single-feed' | 'unknown' | 'out-of-scope'; notes: string };
export type FeedLoss =
  | { mode: 'per-length'; lengthM: Quantity<'m'>; lossDbPerM: Quantity<'dB/m'>; connectorsTotalLossDb: Quantity<'dB'> }
  | { mode: 'assembly-total'; totalLossDb: Quantity<'dB'>; assemblyLabel: string; includedComponents: string; boundary: 'radio-to-antenna-feed' | 'unknown' }
  | { mode: 'unknown'; reason: string };
export type PowerMetric = 'RSSI' | 'RSRP';
export type PowerReading = { metric: PowerMetric; levelDbm: Quantity<'dBm'> };
export type MeasuredInput =
  | { mode: 'paired-levels'; before: PowerReading; after: PowerReading }
  | { mode: 'delta-only'; metric: PowerMetric; deltaDb: Quantity<'dB'> };
export type Decomposed = { method: 'decomposed'; context: Context; before: FeedLoss; after: FeedLoss; placementOnlyChangeDb: Quantity<'dB'>; placementBasis: 'not-known' | 'hypothesis' | 'isolated-measurement' | 'applicable-reference' | 'unconfirmed' };
export type Measured = { method: 'measured-net'; context: Context; measured: MeasuredInput; captureKind: 'single-pair' | 'summary-value'; measurementNote: string };
export type ComparisonRequest = Decomposed | Measured;
export type Interpretation = 'comparable' | 'conditional' | 'needs-review' | 'not-comparable' | 'out-of-scope';
export type Artifact =
  | { kind: 'feed-loss'; side: 'before' | 'after'; lossDb: number }
  | { kind: 'feed-difference'; deltaLossDb: number }
  | { kind: 'break-even'; placementChangeDb: number }
  | { kind: 'prediction'; predictedNetDb: number }
  | { kind: 'measurement-record'; metric: PowerMetric; recordedDeltaDb: number; variability: 'not-evaluated' };
export type Issue = { code: string; fieldPath: string; severity: 'error' | 'review' | 'notice'; message: string };
export type Evaluation =
  | { status: 'invalid'; issues: Issue[]; artifacts: [] }
  | { status: 'evaluated'; method: ComparisonRequest['method']; modelVersion: 'comparison-v2'; coverage: 'partial' | 'complete'; interpretation: Interpretation; artifacts: Artifact[]; issues: Issue[]; containsAssumptions: boolean; containsExamples: boolean; evidenceRefs: string[] };
export type Preferences = { lengthUnit: 'm' | 'cm' | 'mm'; frequencyUnit: 'MHz' | 'GHz'; linkedCoefficient: boolean };
