import { SPECTRUM_CATEGORY_LABELS, SPECTRUM_ENTRIES, type SpectrumRegion, type SpectrumUseCategory } from "@/data/spectrumUses";
import { assertFinite } from "./errors";

export function findUsesAtFrequency(freqMHz:number){assertFinite(freqMHz,"frequency");return SPECTRUM_ENTRIES.filter(entry=>freqMHz>=entry.rangeMHz.low&&freqMHz<=entry.rangeMHz.high)}
export function filterByRegionAndCategory(region:SpectrumRegion,category?:SpectrumUseCategory){return SPECTRUM_ENTRIES.filter(entry=>entry.region===region&&(!category||entry.category===category))}
export function searchSpectrumEntries(query:string){const q=query.trim().toLowerCase();if(!q)return [...SPECTRUM_ENTRIES];return SPECTRUM_ENTRIES.filter(entry=>[entry.bandLabel,entry.useSummary,entry.iotRelevance,SPECTRUM_CATEGORY_LABELS[entry.category],entry.region,entry.sharing?.mechanism??"",entry.sharing?.note??""].some(value=>value.toLowerCase().includes(q)))}
