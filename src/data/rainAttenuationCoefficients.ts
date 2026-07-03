/**
 * ITU-R P.838-3 Table 5: 降雨特性減衰の周波数別係数 k, α（水平/垂直偏波）。
 *
 * 特性降雨減衰 γ_R[dB/km] = k · R^α（R は降雨強度[mm/h]）。
 * 本表は勧告 ITU-R P.838-3 (2005) の Table 5 を一次PDFから機械転記したもの（1〜1000 GHz）。
 * 周波数間は P.838 の補間規則（k は log-log、α は log(周波数)-線形）で補間する。
 *
 * 出典: Recommendation ITU-R P.838-3, "Specific attenuation model for rain for use in
 *       prediction methods", Table 5.
 *       https://www.itu.int/dms_pubrec/itu-r/rec/p/r-rec-p.838-3-200503-i!!pdf-e.pdf
 */

export type RainCoefficientRow = {
  /** 周波数[GHz]。 */
  frequencyGHz: number;
  /** 水平偏波の係数 k_H。 */
  kH: number;
  /** 水平偏波の指数 α_H。 */
  alphaH: number;
  /** 垂直偏波の係数 k_V。 */
  kV: number;
  /** 垂直偏波の指数 α_V。 */
  alphaV: number;
};

/** ITU-R P.838-3 Table 5（周波数昇順）。 */
export const P838_RAIN_COEFFICIENTS: readonly RainCoefficientRow[] = [
  { frequencyGHz: 1, kH: 0.0000259, alphaH: 0.9691, kV: 0.0000308, alphaV: 0.8592 },
  { frequencyGHz: 1.5, kH: 0.0000443, alphaH: 1.0185, kV: 0.0000574, alphaV: 0.8957 },
  { frequencyGHz: 2, kH: 0.0000847, alphaH: 1.0664, kV: 0.0000998, alphaV: 0.949 },
  { frequencyGHz: 2.5, kH: 0.0001321, alphaH: 1.1209, kV: 0.0001464, alphaV: 1.0085 },
  { frequencyGHz: 3, kH: 0.000139, alphaH: 1.2322, kV: 0.0001942, alphaV: 1.0688 },
  { frequencyGHz: 3.5, kH: 0.0001155, alphaH: 1.4189, kV: 0.0002346, alphaV: 1.1387 },
  { frequencyGHz: 4, kH: 0.0001071, alphaH: 1.6009, kV: 0.0002461, alphaV: 1.2476 },
  { frequencyGHz: 4.5, kH: 0.000134, alphaH: 1.6948, kV: 0.0002347, alphaV: 1.3987 },
  { frequencyGHz: 5, kH: 0.0002162, alphaH: 1.6969, kV: 0.0002428, alphaV: 1.5317 },
  { frequencyGHz: 5.5, kH: 0.0003909, alphaH: 1.6499, kV: 0.0003115, alphaV: 1.5882 },
  { frequencyGHz: 6, kH: 0.0007056, alphaH: 1.59, kV: 0.0004878, alphaV: 1.5728 },
  { frequencyGHz: 7, kH: 0.001915, alphaH: 1.481, kV: 0.001425, alphaV: 1.4745 },
  { frequencyGHz: 8, kH: 0.004115, alphaH: 1.3905, kV: 0.00345, alphaV: 1.3797 },
  { frequencyGHz: 9, kH: 0.007535, alphaH: 1.3155, kV: 0.006691, alphaV: 1.2895 },
  { frequencyGHz: 10, kH: 0.01217, alphaH: 1.2571, kV: 0.01129, alphaV: 1.2156 },
  { frequencyGHz: 11, kH: 0.01772, alphaH: 1.214, kV: 0.01731, alphaV: 1.1617 },
  { frequencyGHz: 12, kH: 0.02386, alphaH: 1.1825, kV: 0.02455, alphaV: 1.1216 },
  { frequencyGHz: 13, kH: 0.03041, alphaH: 1.1586, kV: 0.03266, alphaV: 1.0901 },
  { frequencyGHz: 14, kH: 0.03738, alphaH: 1.1396, kV: 0.04126, alphaV: 1.0646 },
  { frequencyGHz: 15, kH: 0.04481, alphaH: 1.1233, kV: 0.05008, alphaV: 1.044 },
  { frequencyGHz: 16, kH: 0.05282, alphaH: 1.1086, kV: 0.05899, alphaV: 1.0273 },
  { frequencyGHz: 17, kH: 0.06146, alphaH: 1.0949, kV: 0.06797, alphaV: 1.0137 },
  { frequencyGHz: 18, kH: 0.07078, alphaH: 1.0818, kV: 0.07708, alphaV: 1.0025 },
  { frequencyGHz: 19, kH: 0.08084, alphaH: 1.0691, kV: 0.08642, alphaV: 0.993 },
  { frequencyGHz: 20, kH: 0.09164, alphaH: 1.0568, kV: 0.09611, alphaV: 0.9847 },
  { frequencyGHz: 21, kH: 0.1032, alphaH: 1.0447, kV: 0.1063, alphaV: 0.9771 },
  { frequencyGHz: 22, kH: 0.1155, alphaH: 1.0329, kV: 0.117, alphaV: 0.97 },
  { frequencyGHz: 23, kH: 0.1286, alphaH: 1.0214, kV: 0.1284, alphaV: 0.963 },
  { frequencyGHz: 24, kH: 0.1425, alphaH: 1.0101, kV: 0.1404, alphaV: 0.9561 },
  { frequencyGHz: 25, kH: 0.1571, alphaH: 0.9991, kV: 0.1533, alphaV: 0.9491 },
  { frequencyGHz: 26, kH: 0.1724, alphaH: 0.9884, kV: 0.1669, alphaV: 0.9421 },
  { frequencyGHz: 27, kH: 0.1884, alphaH: 0.978, kV: 0.1813, alphaV: 0.9349 },
  { frequencyGHz: 28, kH: 0.2051, alphaH: 0.9679, kV: 0.1964, alphaV: 0.9277 },
  { frequencyGHz: 29, kH: 0.2224, alphaH: 0.958, kV: 0.2124, alphaV: 0.9203 },
  { frequencyGHz: 30, kH: 0.2403, alphaH: 0.9485, kV: 0.2291, alphaV: 0.9129 },
  { frequencyGHz: 31, kH: 0.2588, alphaH: 0.9392, kV: 0.2465, alphaV: 0.9055 },
  { frequencyGHz: 32, kH: 0.2778, alphaH: 0.9302, kV: 0.2646, alphaV: 0.8981 },
  { frequencyGHz: 33, kH: 0.2972, alphaH: 0.9214, kV: 0.2833, alphaV: 0.8907 },
  { frequencyGHz: 34, kH: 0.3171, alphaH: 0.9129, kV: 0.3026, alphaV: 0.8834 },
  { frequencyGHz: 35, kH: 0.3374, alphaH: 0.9047, kV: 0.3224, alphaV: 0.8761 },
  { frequencyGHz: 36, kH: 0.358, alphaH: 0.8967, kV: 0.3427, alphaV: 0.869 },
  { frequencyGHz: 37, kH: 0.3789, alphaH: 0.889, kV: 0.3633, alphaV: 0.8621 },
  { frequencyGHz: 38, kH: 0.4001, alphaH: 0.8816, kV: 0.3844, alphaV: 0.8552 },
  { frequencyGHz: 39, kH: 0.4215, alphaH: 0.8743, kV: 0.4058, alphaV: 0.8486 },
  { frequencyGHz: 40, kH: 0.4431, alphaH: 0.8673, kV: 0.4274, alphaV: 0.8421 },
  { frequencyGHz: 41, kH: 0.4647, alphaH: 0.8605, kV: 0.4492, alphaV: 0.8357 },
  { frequencyGHz: 42, kH: 0.4865, alphaH: 0.8539, kV: 0.4712, alphaV: 0.8296 },
  { frequencyGHz: 43, kH: 0.5084, alphaH: 0.8476, kV: 0.4932, alphaV: 0.8236 },
  { frequencyGHz: 44, kH: 0.5302, alphaH: 0.8414, kV: 0.5153, alphaV: 0.8179 },
  { frequencyGHz: 45, kH: 0.5521, alphaH: 0.8355, kV: 0.5375, alphaV: 0.8123 },
  { frequencyGHz: 46, kH: 0.5738, alphaH: 0.8297, kV: 0.5596, alphaV: 0.8069 },
  { frequencyGHz: 47, kH: 0.5956, alphaH: 0.8241, kV: 0.5817, alphaV: 0.8017 },
  { frequencyGHz: 48, kH: 0.6172, alphaH: 0.8187, kV: 0.6037, alphaV: 0.7967 },
  { frequencyGHz: 49, kH: 0.6386, alphaH: 0.8134, kV: 0.6255, alphaV: 0.7918 },
  { frequencyGHz: 50, kH: 0.66, alphaH: 0.8084, kV: 0.6472, alphaV: 0.7871 },
  { frequencyGHz: 51, kH: 0.6811, alphaH: 0.8034, kV: 0.6687, alphaV: 0.7826 },
  { frequencyGHz: 52, kH: 0.702, alphaH: 0.7987, kV: 0.6901, alphaV: 0.7783 },
  { frequencyGHz: 53, kH: 0.7228, alphaH: 0.7941, kV: 0.7112, alphaV: 0.7741 },
  { frequencyGHz: 54, kH: 0.7433, alphaH: 0.7896, kV: 0.7321, alphaV: 0.77 },
  { frequencyGHz: 55, kH: 0.7635, alphaH: 0.7853, kV: 0.7527, alphaV: 0.7661 },
  { frequencyGHz: 56, kH: 0.7835, alphaH: 0.7811, kV: 0.773, alphaV: 0.7623 },
  { frequencyGHz: 57, kH: 0.8032, alphaH: 0.7771, kV: 0.7931, alphaV: 0.7587 },
  { frequencyGHz: 58, kH: 0.8226, alphaH: 0.7731, kV: 0.8129, alphaV: 0.7552 },
  { frequencyGHz: 59, kH: 0.8418, alphaH: 0.7693, kV: 0.8324, alphaV: 0.7518 },
  { frequencyGHz: 60, kH: 0.8606, alphaH: 0.7656, kV: 0.8515, alphaV: 0.7486 },
  { frequencyGHz: 61, kH: 0.8791, alphaH: 0.7621, kV: 0.8704, alphaV: 0.7454 },
  { frequencyGHz: 62, kH: 0.8974, alphaH: 0.7586, kV: 0.8889, alphaV: 0.7424 },
  { frequencyGHz: 63, kH: 0.9153, alphaH: 0.7552, kV: 0.9071, alphaV: 0.7395 },
  { frequencyGHz: 64, kH: 0.9328, alphaH: 0.752, kV: 0.925, alphaV: 0.7366 },
  { frequencyGHz: 65, kH: 0.9501, alphaH: 0.7488, kV: 0.9425, alphaV: 0.7339 },
  { frequencyGHz: 66, kH: 0.967, alphaH: 0.7458, kV: 0.9598, alphaV: 0.7313 },
  { frequencyGHz: 67, kH: 0.9836, alphaH: 0.7428, kV: 0.9767, alphaV: 0.7287 },
  { frequencyGHz: 68, kH: 0.9999, alphaH: 0.74, kV: 0.9932, alphaV: 0.7262 },
  { frequencyGHz: 69, kH: 1.0159, alphaH: 0.7372, kV: 1.0094, alphaV: 0.7238 },
  { frequencyGHz: 70, kH: 1.0315, alphaH: 0.7345, kV: 1.0253, alphaV: 0.7215 },
  { frequencyGHz: 71, kH: 1.0468, alphaH: 0.7318, kV: 1.0409, alphaV: 0.7193 },
  { frequencyGHz: 72, kH: 1.0618, alphaH: 0.7293, kV: 1.0561, alphaV: 0.7171 },
  { frequencyGHz: 73, kH: 1.0764, alphaH: 0.7268, kV: 1.0711, alphaV: 0.715 },
  { frequencyGHz: 74, kH: 1.0908, alphaH: 0.7244, kV: 1.0857, alphaV: 0.713 },
  { frequencyGHz: 75, kH: 1.1048, alphaH: 0.7221, kV: 1.1, alphaV: 0.711 },
  { frequencyGHz: 76, kH: 1.1185, alphaH: 0.7199, kV: 1.1139, alphaV: 0.7091 },
  { frequencyGHz: 77, kH: 1.132, alphaH: 0.7177, kV: 1.1276, alphaV: 0.7073 },
  { frequencyGHz: 78, kH: 1.1451, alphaH: 0.7156, kV: 1.141, alphaV: 0.7055 },
  { frequencyGHz: 79, kH: 1.1579, alphaH: 0.7135, kV: 1.1541, alphaV: 0.7038 },
  { frequencyGHz: 80, kH: 1.1704, alphaH: 0.7115, kV: 1.1668, alphaV: 0.7021 },
  { frequencyGHz: 81, kH: 1.1827, alphaH: 0.7096, kV: 1.1793, alphaV: 0.7004 },
  { frequencyGHz: 82, kH: 1.1946, alphaH: 0.7077, kV: 1.1915, alphaV: 0.6988 },
  { frequencyGHz: 83, kH: 1.2063, alphaH: 0.7058, kV: 1.2034, alphaV: 0.6973 },
  { frequencyGHz: 84, kH: 1.2177, alphaH: 0.704, kV: 1.2151, alphaV: 0.6958 },
  { frequencyGHz: 85, kH: 1.2289, alphaH: 0.7023, kV: 1.2265, alphaV: 0.6943 },
  { frequencyGHz: 86, kH: 1.2398, alphaH: 0.7006, kV: 1.2376, alphaV: 0.6929 },
  { frequencyGHz: 87, kH: 1.2504, alphaH: 0.699, kV: 1.2484, alphaV: 0.6915 },
  { frequencyGHz: 88, kH: 1.2607, alphaH: 0.6974, kV: 1.259, alphaV: 0.6902 },
  { frequencyGHz: 89, kH: 1.2708, alphaH: 0.6959, kV: 1.2694, alphaV: 0.6889 },
  { frequencyGHz: 90, kH: 1.2807, alphaH: 0.6944, kV: 1.2795, alphaV: 0.6876 },
  { frequencyGHz: 91, kH: 1.2903, alphaH: 0.6929, kV: 1.2893, alphaV: 0.6864 },
  { frequencyGHz: 92, kH: 1.2997, alphaH: 0.6915, kV: 1.2989, alphaV: 0.6852 },
  { frequencyGHz: 93, kH: 1.3089, alphaH: 0.6901, kV: 1.3083, alphaV: 0.684 },
  { frequencyGHz: 94, kH: 1.3179, alphaH: 0.6888, kV: 1.3175, alphaV: 0.6828 },
  { frequencyGHz: 95, kH: 1.3266, alphaH: 0.6875, kV: 1.3265, alphaV: 0.6817 },
  { frequencyGHz: 96, kH: 1.3351, alphaH: 0.6862, kV: 1.3352, alphaV: 0.6806 },
  { frequencyGHz: 97, kH: 1.3434, alphaH: 0.685, kV: 1.3437, alphaV: 0.6796 },
  { frequencyGHz: 98, kH: 1.3515, alphaH: 0.6838, kV: 1.352, alphaV: 0.6785 },
  { frequencyGHz: 99, kH: 1.3594, alphaH: 0.6826, kV: 1.3601, alphaV: 0.6775 },
  { frequencyGHz: 100, kH: 1.3671, alphaH: 0.6815, kV: 1.368, alphaV: 0.6765 },
  { frequencyGHz: 120, kH: 1.4866, alphaH: 0.664, kV: 1.4911, alphaV: 0.6609 },
  { frequencyGHz: 150, kH: 1.5823, alphaH: 0.6494, kV: 1.5896, alphaV: 0.6466 },
  { frequencyGHz: 200, kH: 1.6378, alphaH: 0.6382, kV: 1.6443, alphaV: 0.6343 },
  { frequencyGHz: 300, kH: 1.6286, alphaH: 0.6296, kV: 1.6286, alphaV: 0.6262 },
  { frequencyGHz: 400, kH: 1.586, alphaH: 0.6262, kV: 1.582, alphaV: 0.6256 },
  { frequencyGHz: 500, kH: 1.5418, alphaH: 0.6253, kV: 1.5366, alphaV: 0.6272 },
  { frequencyGHz: 600, kH: 1.5013, alphaH: 0.6262, kV: 1.4967, alphaV: 0.6293 },
  { frequencyGHz: 700, kH: 1.4654, alphaH: 0.6284, kV: 1.4622, alphaV: 0.6315 },
  { frequencyGHz: 800, kH: 1.4335, alphaH: 0.6315, kV: 1.4321, alphaV: 0.6334 },
  { frequencyGHz: 900, kH: 1.405, alphaH: 0.6353, kV: 1.4056, alphaV: 0.6351 },
  { frequencyGHz: 1000, kH: 1.3795, alphaH: 0.6396, kV: 1.3822, alphaV: 0.6365 }
];
