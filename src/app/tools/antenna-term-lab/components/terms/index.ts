"use client";

import type { ComponentType } from "react";

// Implemented terms
import { TermFrequencyWavelength } from "./TermFrequencyWavelength";
import { TermDielectricConstant } from "./TermDielectricConstant";
import { TermPolarization } from "./TermPolarization";
import { TermNearFarField } from "./TermNearFarField";
import { TermReciprocity } from "./TermReciprocity";

import { TermAntennaGain } from "./TermAntennaGain";

export {
  TermFrequencyWavelength,
  TermDielectricConstant,
  TermPolarization,
  TermNearFarField,
  TermReciprocity,
  TermAntennaGain
};

// Placeholder terms
export const TermRadiationPattern = () => null;
export const TermBeamwidth = () => null;
export const TermRadiationEfficiency = () => null;
export const TermEffectiveAperture = () => null;
export const TermEfficiencyGainDiff = () => null;
export const TermVSWR = () => null;
export const TermReturnLossS11 = () => null;
export const TermImpedanceMatching = () => null;
export const TermResonance = () => null;
export const TermBandwidthVswr2 = () => null;
export const TermCableLossSqrtF = () => null;
export const TermGroundPlane = () => null;
export const TermEirp = () => null;
export const TermIsolation = () => null;
export const TermMultipathFading = () => null;

export const termComponentsMap: Record<string, ComponentType> = {
  "frequency-wavelength": TermFrequencyWavelength,
  "dielectric-constant": TermDielectricConstant,
  "polarization": TermPolarization,
  "near-far-field": TermNearFarField,
  "reciprocity": TermReciprocity,
  "antenna-gain": TermAntennaGain,
  "radiation-pattern": TermRadiationPattern,
  "beamwidth": TermBeamwidth,
  "radiation-efficiency": TermRadiationEfficiency,
  "effective-aperture": TermEffectiveAperture,
  "efficiency-gain-diff": TermEfficiencyGainDiff,
  "vswr": TermVSWR,
  "return-loss-s11": TermReturnLossS11,
  "impedance-matching": TermImpedanceMatching,
  "resonance": TermResonance,
  "bandwidth-vswr2": TermBandwidthVswr2,
  "cable-loss-sqrt-f": TermCableLossSqrtF,
  "ground-plane": TermGroundPlane,
  "eirp": TermEirp,
  "isolation": TermIsolation,
  "multipath-fading": TermMultipathFading
};
