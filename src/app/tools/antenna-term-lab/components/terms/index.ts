"use client";

import type { ComponentType } from "react";

// Implemented terms
import { TermFrequencyWavelength } from "./TermFrequencyWavelength";
import { TermDielectricConstant } from "./TermDielectricConstant";
import { TermPolarization } from "./TermPolarization";
import { TermNearFarField } from "./TermNearFarField";
import { TermReciprocity } from "./TermReciprocity";

import { TermAntennaGain } from "./TermAntennaGain";

import { TermRadiationPattern } from "./TermRadiationPattern";
import { TermBeamwidth } from "./TermBeamwidth";
import { TermRadiationEfficiency } from "./TermRadiationEfficiency";
import { TermEffectiveAperture } from "./TermEffectiveAperture";
import { TermEfficiencyGainDiff } from "./TermEfficiencyGainDiff";
import { TermVSWR } from "./TermVSWR";
import { TermReturnLossS11 } from "./TermReturnLossS11";
import { TermImpedanceMatching } from "./TermImpedanceMatching";
import { TermResonance } from "./TermResonance";
import { TermBandwidthVswr2 } from "./TermBandwidthVswr2";
import { TermCableLossSqrtF } from "./TermCableLossSqrtF";
import { TermGroundPlane } from "./TermGroundPlane";
import { TermEirp } from "./TermEirp";
import { TermIsolation } from "./TermIsolation";
import { TermMultipathFading } from "./TermMultipathFading";

export {
  TermFrequencyWavelength,
  TermDielectricConstant,
  TermPolarization,
  TermNearFarField,
  TermReciprocity,
  TermAntennaGain,
  TermRadiationPattern
  ,TermBeamwidth, TermRadiationEfficiency, TermEffectiveAperture, TermEfficiencyGainDiff,
  TermVSWR, TermReturnLossS11, TermImpedanceMatching, TermResonance, TermBandwidthVswr2, TermCableLossSqrtF,
  TermGroundPlane, TermEirp, TermIsolation, TermMultipathFading
};

// Placeholder terms

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
