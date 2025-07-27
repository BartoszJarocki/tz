/**
 * City abbreviations for each timezone offset
 */
export const TIMEZONE_CITY_ABBREVIATIONS: Record<number, string[]> = {
  [-12]: ["BAK", "HOW"],
  [-11]: ["PAG", "NIU", "MID"],
  [-10]: ["HNL", "HIL", "KON", "KAH"],
  [-9]: ["ANC", "JNU", "FAI", "SIT"],
  [-8]: ["LAX", "SFO", "SEA", "YVR", "LAS", "PDX"],
  [-7]: ["DEN", "PHX", "YYC", "SLC", "ABQ", "YEG"],
  [-6]: ["CHI", "MEX", "HOU", "DFW", "YWG", "GUA"],
  [-5]: ["NYC", "YYZ", "MIA", "ATL", "LIM", "BOG"],
  [-4]: ["YHZ", "CCS", "LPB", "SCL", "MAO"],
  [-3]: ["SAO", "RIO", "BUE", "MVD", "BSB"],
  [-2]: ["FEN", "SGI"],
  [-1]: ["PRA", "AZO"],
  [0]: ["LON", "DUB", "LIS", "CAS", "ACC", "DKR"],
  [1]: ["PAR", "BER", "ROM", "MAD", "AMS", "VIE"],
  [2]: ["CAI", "ATH", "HEL", "KIV", "BUC", "IST"],
  [3]: ["MOW", "RUH", "BGW", "KWI", "NBO"],
  [4]: ["DXB", "AUH", "BAK", "TBS", "EVN"],
  [5]: ["KHI", "ISB", "TAS", "ALA", "ASB"],
  [6]: ["DAC", "CMB", "FRU", "THI"],
  [7]: ["BKK", "CGK", "SGN", "HAN", "PNH"],
  [8]: ["SIN", "PEK", "SHA", "HKG", "MNL", "KUL"],
  [9]: ["NRT", "ICN", "FNJ", "KIX", "HND"],
  [10]: ["SYD", "MEL", "BNE", "CBR", "POM"],
  [11]: ["NOU", "HIR", "VLI"],
}

export function getCityAbbreviationsForTimezone(offset: number): string[] {
  return TIMEZONE_CITY_ABBREVIATIONS[offset] || []
}
