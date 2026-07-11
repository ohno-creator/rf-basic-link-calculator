"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { MetricCard } from "@/components/MetricCard";
import {
  CARRIER_PROFILES,
  STANDARD_BAND_RANGES,
  type CarrierBandDeployment,
  type CarrierProfile,
  type DeploymentStatus,
  type WorldRegion
} from "@/data/cellularCarrierBands";
import { calculateSmallAntennaLimit } from "@/lib/rf/antenna";
import {
  carriersForCountry,
  carriersForRegion,
  continuousBandwidthMHz,
  countriesForRegion,
  fractionalBandwidthPercent,
  representativeFrequencyMHz,
  searchCarrierProfiles,
  type CarrierSearchSort
} from "@/lib/rf/cellularCarrierCatalog";
import { formatNumber } from "@/lib/rf/format";

export type BandMapMode = "intro" | "practice" | "design" | "world" | "search";

export const BAND_MAP_MODES: { id: BandMapMode; label: string }[] = [
  { id: "intro", label: "入門" },
  { id: "practice", label: "実務" },
  { id: "design", label: "設計" },
  { id: "world", label: "世界" },
  { id: "search", label: "検索一覧" }
];

const REGION_OPTIONS: { id: WorldRegion; label: string }[] = [
  { id: "japan", label: "日本" },
  { id: "north-america", label: "北米" },
  { id: "europe", label: "欧州" },
  { id: "china", label: "中国" },
  { id: "korea", label: "韓国" },
  { id: "india", label: "インド" }
];

const statusLabel: Record<DeploymentStatus, string> = {
  "confirmed-current": "現行確認済み",
  "confirmed-historical": "導入実績",
  "unverified-current": "現行未確認",
  revoked: "免許取消・履歴"
};

function rangeLabel(key: string): string {
  const range = STANDARD_BAND_RANGES.find((item) => item.key === key);
  if (!range) return "標準レンジ未収録";
  if (range.tddMHz) return `${range.tddMHz[0]}–${range.tddMHz[1]} MHz（TDD共用）`;
  return `UL ${range.uplinkMHz![0]}–${range.uplinkMHz![1]} / DL ${range.downlinkMHz![0]}–${range.downlinkMHz![1]} MHz`;
}

function DeploymentRows({ profile }: { profile: CarrierProfile }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs text-slate-500">
          <tr><th className="py-2 pr-3">Band</th><th className="py-2 pr-3">3GPP標準レンジ</th><th className="py-2 pr-3">位置づけ</th><th className="py-2">IoT／状態</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {profile.bands.map((deployment) => (
            <tr key={`${profile.id}-${deployment.band}`} className={deployment.status === "revoked" ? "bg-slate-50 text-slate-400" : "text-slate-700"}>
              <td className="py-2 pr-3 font-bold text-slate-950">{deployment.band}</td>
              <td className="py-2 pr-3 tabular-nums">{rangeLabel(deployment.band)}</td>
              <td className="py-2 pr-3">{deployment.positioning}</td>
              <td className="py-2">{deployment.iot?.join(" / ") || statusLabel[deployment.status ?? "confirmed-current"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileCard({ profile }: { profile: CarrierProfile }) {
  return (
    <Card as="section" padding="lg" data-testid="carrier-profile" data-carrier={profile.id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold text-staf-dark">{profile.country}</p><h2 className="text-lg font-bold text-slate-950">{profile.carrier}</h2></div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">確認日 {profile.checkedAt}</span>
      </div>
      <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-slate-700"><strong>IoT：</strong>{profile.iotSummary}</p>
      {profile.allocationNote ? <p className="mt-2 text-xs leading-relaxed text-amber-800">注意: {profile.allocationNote}</p> : null}
      <div className="mt-4"><DeploymentRows profile={profile} /></div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        表の周波数は3GPP Band全体です。事業者の実割当・全国利用範囲ではありません。出典: {" "}
        <a className="font-semibold underline" href={profile.sourceUrl} target="_blank" rel="noreferrer">{profile.sourceLabel}</a>
      </p>
    </Card>
  );
}

function CarrierSelector({ profiles, selectedId, onChange }: { profiles: readonly CarrierProfile[]; selectedId: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="キャリアを選択">
      {profiles.map((profile) => (
        <button key={profile.id} type="button" aria-pressed={profile.id === selectedId} onClick={() => onChange(profile.id)} className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${profile.id === selectedId ? "border-staf bg-staf text-white" : "border-slate-200 bg-white text-slate-600 hover:border-staf/40"}`}>
          {profile.carrier}
        </button>
      ))}
    </div>
  );
}

function PracticeMode() {
  const profiles = carriersForRegion("japan");
  const [selectedId, setSelectedId] = useState(profiles[0].id);
  const profile = profiles.find((item) => item.id === selectedId) ?? profiles[0];
  return <div className="space-y-4"><Card padding="lg"><h2 className="font-bold text-slate-950">日本4キャリアの実務比較</h2><p className="mt-1 text-sm text-slate-600">キャリアを選ぶと、代表BandのUL/DLとIoTでの位置づけを確認できます。</p><div className="mt-4"><CarrierSelector profiles={profiles} selectedId={profile.id} onChange={setSelectedId} /></div></Card><ProfileCard profile={profile} /></div>;
}

function WorldMode() {
  const [region, setRegion] = useState<WorldRegion>("japan");
  const countries = countriesForRegion(region);
  const [country, setCountry] = useState("日本");
  const availableCountry = countries.includes(country) ? country : countries[0];
  const profiles = carriersForCountry(availableCountry);
  const [selectedId, setSelectedId] = useState("jp-docomo");
  const profile = profiles.find((item) => item.id === selectedId) ?? profiles[0];

  const selectRegion = (next: WorldRegion) => {
    setRegion(next);
    const nextCountry = countriesForRegion(next)[0];
    setCountry(nextCountry);
    setSelectedId(carriersForCountry(nextCountry)[0].id);
  };

  return (
    <div className="space-y-4">
      <Card padding="lg"><h2 className="font-bold text-slate-950">国 → キャリア → Band</h2><p className="mt-1 text-sm text-slate-600">地域を選び、国と事業者を掘り下げます。欧州はドイツとフランスを分け、グループ全体へ一般化しません。</p>
        <div className="mt-4 flex flex-wrap gap-2">{REGION_OPTIONS.map((item) => <button key={item.id} type="button" aria-pressed={region === item.id} onClick={() => selectRegion(item.id)} className={`rounded-full border px-3 py-2 text-sm font-semibold ${region === item.id ? "border-staf bg-staf text-white" : "border-slate-200 bg-white text-slate-600"}`}>{item.label}</button>)}</div>
        {countries.length > 1 ? <label className="mt-4 block text-sm font-bold text-slate-800">国<select className="mt-2 block w-full rounded-md border border-slate-300 bg-white p-2 font-normal" value={availableCountry} onChange={(event) => { const next = event.target.value; setCountry(next); setSelectedId(carriersForCountry(next)[0].id); }}>{countries.map((item) => <option key={item}>{item}</option>)}</select></label> : null}
        <div className="mt-4"><CarrierSelector profiles={profiles} selectedId={profile.id} onChange={setSelectedId} /></div>
      </Card>
      <ProfileCard profile={profile} />
    </div>
  );
}

function DesignMode() {
  const [bandKey, setBandKey] = useState("B28");
  const [radiusMm, setRadiusMm] = useState(40);
  const band = STANDARD_BAND_RANGES.find((item) => item.key === bandKey)!;
  const centerMHz = representativeFrequencyMHz(band);
  const bandwidthMHz = continuousBandwidthMHz(band);
  const fbwPercent = fractionalBandwidthPercent(band);
  const chu = calculateSmallAntennaLimit({ frequencyMHz: centerMHz, radiusMm, targetBandwidthPercent: fbwPercent });
  return (
    <div className="space-y-4">
      <Card padding="lg"><h2 className="font-bold text-slate-950">Band幅と小型アンテナ限界</h2><p className="mt-1 text-sm text-slate-600">FDDは片方向の連続幅、TDDは共用レンジ幅で比帯域を求めます。FDDのduplex gapは帯域幅に含めません。</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Band<select className="mt-2 block w-full rounded-md border border-slate-300 bg-white p-2 font-normal" value={bandKey} onChange={(event) => setBandKey(event.target.value)}>{STANDARD_BAND_RANGES.map((item) => <option key={item.key}>{item.key}</option>)}</select></label><label className="text-sm font-bold">アンテナを囲む球の半径 [mm]<input className="mt-2 block w-full rounded-md border border-slate-300 p-2 font-normal" type="number" min={1} value={radiusMm} onChange={(event) => setRadiusMm(Math.max(1, Number(event.target.value) || 1))} /></label></div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="代表周波数" value={formatNumber(centerMHz, 1)} unit="MHz" /><MetricCard label="連続帯域幅" value={formatNumber(bandwidthMHz, 1)} unit="MHz" /><MetricCard label="要求比帯域" value={formatNumber(fbwPercent, 2)} unit="%" /><MetricCard label="Chu帯域上限 ≈1/Q" value={formatNumber(chu.maxFractionalBandwidthPercent, 2)} unit="%" /></div>
      <Card padding="lg" variant="slate" shadow={false}>
        <p className="text-sm leading-relaxed text-slate-700">
          <strong>{chu.ka < 1 ? "判定" : "適用条件外"}：</strong>
          {chu.ka < 1
            ? `要求帯域はChu粗上限の ${formatNumber(chu.targetToLimitRatio, 1)} 倍です。`
            : `ka=${formatNumber(chu.ka, 2)} で電気的小形の目安 ka<1 を満たさないため、Chu値は参考表示です。`}
          Qmin = 1/(ka)³ + 1/(ka)、比帯域上限 ≈ 1/Qmin（電気的小形・理想導体・放射効率100%の粗い目安）。
          実機では損失、筐体、整合、複共振を別途評価してください。
        </p>
      </Card>
    </div>
  );
}

function SearchMode() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CarrierSearchSort>("country");
  const matches = useMemo(() => searchCarrierProfiles(query, sort), [query, sort]);
  return (
    <div className="space-y-4"><Card padding="lg"><h2 className="font-bold text-slate-950">世界のキャリアを横断検索</h2><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]"><label className="text-sm font-bold">検索<input data-testid="carrier-search" className="mt-2 block w-full rounded-md border border-slate-300 p-2 font-normal" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="B19 / 800 / ドコモ / NB-IoT" /></label><label className="text-sm font-bold">並び順<select className="mt-2 block w-full rounded-md border border-slate-300 bg-white p-2 font-normal" value={sort} onChange={(event) => setSort(event.target.value as CarrierSearchSort)}><option value="country">国</option><option value="carrier">キャリア</option><option value="band">先頭Band</option></select></label></div><p className="mt-3 text-sm text-slate-600">{matches.length}件 / 全{CARRIER_PROFILES.length}キャリア</p></Card>
      <div data-testid="carrier-search-results" className="grid gap-3 lg:grid-cols-2">{matches.map((profile) => <Card key={profile.id} padding="sm"><p className="text-xs font-semibold text-staf-dark">{profile.country}</p><h3 className="font-bold text-slate-950">{profile.carrier}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{profile.bands.map((band: CarrierBandDeployment) => band.band).join(" / ")}</p><p className="mt-2 text-xs leading-relaxed text-slate-500">{profile.iotSummary}</p></Card>)}</div>
    </div>
  );
}

export function CellularBandModeContent({ mode }: { mode: Exclude<BandMapMode, "intro"> }) {
  if (mode === "practice") return <PracticeMode />;
  if (mode === "design") return <DesignMode />;
  if (mode === "world") return <WorldMode />;
  return <SearchMode />;
}
