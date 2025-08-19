/**
 * Major cities data for each timezone offset
 */
export interface CityInfo {
  name: string
  country: string
  population?: number
  isCapital?: boolean
}

export const TIMEZONE_CITIES: Record<number, CityInfo[]> = {
  [-12]: [
    { name: "Baker Island", country: "United States", isCapital: false },
    { name: "Howland Island", country: "United States", isCapital: false },
  ],
  [-11]: [
    { name: "Pago Pago", country: "American Samoa", isCapital: true },
    { name: "Niue", country: "Niue", isCapital: true },
    { name: "Midway Atoll", country: "United States", isCapital: false },
  ],
  [-10]: [
    { name: "Honolulu", country: "United States", population: 345064, isCapital: true },
    { name: "Hilo", country: "United States", population: 45703, isCapital: false },
    { name: "Kailua-Kona", country: "United States", population: 23000, isCapital: false },
    { name: "Kahului", country: "United States", population: 26337, isCapital: false },
  ],
  [-9]: [
    { name: "Anchorage", country: "United States", population: 291538, isCapital: false },
    { name: "Juneau", country: "United States", population: 32255, isCapital: true },
    { name: "Fairbanks", country: "United States", population: 31516, isCapital: false },
    { name: "Sitka", country: "United States", population: 8458, isCapital: false },
  ],
  [-8]: [
    { name: "Los Angeles", country: "United States", population: 3898747, isCapital: false },
    { name: "San Francisco", country: "United States", population: 873965, isCapital: false },
    { name: "Seattle", country: "United States", population: 749256, isCapital: false },
    { name: "Vancouver", country: "Canada", population: 631486, isCapital: false },
    { name: "Las Vegas", country: "United States", population: 641903, isCapital: false },
    { name: "Portland", country: "United States", population: 652503, isCapital: false },
  ],
  [-7]: [
    { name: "Denver", country: "United States", population: 715522, isCapital: true },
    { name: "Phoenix", country: "United States", population: 1608139, isCapital: true },
    { name: "Calgary", country: "Canada", population: 1336000, isCapital: false },
    { name: "Salt Lake City", country: "United States", population: 200567, isCapital: true },
    { name: "Albuquerque", country: "United States", population: 564559, isCapital: false },
    { name: "Edmonton", country: "Canada", population: 981280, isCapital: false },
  ],
  [-6]: [
    { name: "Chicago", country: "United States", population: 2693976, isCapital: false },
    { name: "Mexico City", country: "Mexico", population: 9209944, isCapital: true },
    { name: "Houston", country: "United States", population: 2320268, isCapital: false },
    { name: "Dallas", country: "United States", population: 1343573, isCapital: false },
    { name: "Winnipeg", country: "Canada", population: 749534, isCapital: false },
    { name: "Guatemala City", country: "Guatemala", population: 994938, isCapital: true },
  ],
  [-5]: [
    { name: "New York City", country: "United States", population: 8336817, isCapital: false },
    { name: "Toronto", country: "Canada", population: 2794356, isCapital: false },
    { name: "Miami", country: "United States", population: 442241, isCapital: false },
    { name: "Atlanta", country: "United States", population: 498715, isCapital: false },
    { name: "Lima", country: "Peru", population: 10092000, isCapital: true },
    { name: "Bogotá", country: "Colombia", population: 7412566, isCapital: true },
  ],
  [-4]: [
    { name: "Halifax", country: "Canada", population: 439819, isCapital: false },
    { name: "Caracas", country: "Venezuela", population: 2935744, isCapital: true },
    { name: "La Paz", country: "Bolivia", population: 835361, isCapital: true },
    { name: "Santiago", country: "Chile", population: 6257516, isCapital: true },
    { name: "Manaus", country: "Brazil", population: 2219580, isCapital: false },
  ],
  [-3]: [
    { name: "São Paulo", country: "Brazil", population: 12325232, isCapital: false },
    { name: "Rio de Janeiro", country: "Brazil", population: 6748000, isCapital: false },
    { name: "Buenos Aires", country: "Argentina", population: 2890151, isCapital: true },
    { name: "Montevideo", country: "Uruguay", population: 1319108, isCapital: true },
    { name: "Brasília", country: "Brazil", population: 3055149, isCapital: true },
  ],
  [-2]: [
    { name: "Fernando de Noronha", country: "Brazil", population: 3012, isCapital: false },
    { name: "South Georgia", country: "United Kingdom", population: 30, isCapital: false },
  ],
  [-1]: [
    { name: "Praia", country: "Cape Verde", population: 159050, isCapital: true },
    { name: "Azores", country: "Portugal", population: 236440, isCapital: false },
  ],
  [0]: [
    { name: "London", country: "United Kingdom", population: 9648110, isCapital: true },
    { name: "Dublin", country: "Ireland", population: 1388000, isCapital: true },
    { name: "Lisbon", country: "Portugal", population: 544851, isCapital: true },
    { name: "Casablanca", country: "Morocco", population: 3359818, isCapital: false },
    { name: "Accra", country: "Ghana", population: 2291352, isCapital: true },
    { name: "Dakar", country: "Senegal", population: 1146053, isCapital: true },
  ],
  [1]: [
    { name: "Paris", country: "France", population: 2165423, isCapital: true },
    { name: "Berlin", country: "Germany", population: 3669491, isCapital: true },
    { name: "Rome", country: "Italy", population: 2872800, isCapital: true },
    { name: "Madrid", country: "Spain", population: 3223334, isCapital: true },
    { name: "Amsterdam", country: "Netherlands", population: 873555, isCapital: true },
    { name: "Vienna", country: "Austria", population: 1911191, isCapital: true },
  ],
  [2]: [
    { name: "Cairo", country: "Egypt", population: 10230350, isCapital: true },
    { name: "Athens", country: "Greece", population: 3153355, isCapital: true },
    { name: "Helsinki", country: "Finland", population: 658864, isCapital: true },
    { name: "Kiev", country: "Ukraine", population: 2962180, isCapital: true },
    { name: "Bucharest", country: "Romania", population: 1883425, isCapital: true },
    { name: "Istanbul", country: "Turkey", population: 15519267, isCapital: false },
  ],
  [3]: [
    { name: "Moscow", country: "Russia", population: 12615279, isCapital: true },
    { name: "Riyadh", country: "Saudi Arabia", population: 7676654, isCapital: true },
    { name: "Baghdad", country: "Iraq", population: 7216040, isCapital: true },
    { name: "Kuwait City", country: "Kuwait", population: 4270571, isCapital: true },
    { name: "Nairobi", country: "Kenya", population: 4397073, isCapital: true },
  ],
  [4]: [
    { name: "Dubai", country: "UAE", population: 3554000, isCapital: false },
    { name: "Abu Dhabi", country: "UAE", population: 1482816, isCapital: true },
    { name: "Baku", country: "Azerbaijan", population: 2293100, isCapital: true },
    { name: "Tbilisi", country: "Georgia", population: 1108717, isCapital: true },
    { name: "Yerevan", country: "Armenia", population: 1086677, isCapital: true },
  ],
  [5]: [
    { name: "Karachi", country: "Pakistan", population: 14910352, isCapital: false },
    { name: "Islamabad", country: "Pakistan", population: 1014825, isCapital: true },
    { name: "Tashkent", country: "Uzbekistan", population: 2571668, isCapital: true },
    { name: "Almaty", country: "Kazakhstan", population: 1916384, isCapital: false },
    { name: "Ashgabat", country: "Turkmenistan", population: 1031992, isCapital: true },
  ],
  [6]: [
    { name: "Dhaka", country: "Bangladesh", population: 9540000, isCapital: true },
    { name: "Colombo", country: "Sri Lanka", population: 752993, isCapital: true },
    { name: "Bishkek", country: "Kyrgyzstan", population: 1027200, isCapital: true },
    { name: "Thimphu", country: "Bhutan", population: 203000, isCapital: true },
  ],
  [7]: [
    { name: "Bangkok", country: "Thailand", population: 10539415, isCapital: true },
    { name: "Jakarta", country: "Indonesia", population: 10770487, isCapital: true },
    { name: "Ho Chi Minh City", country: "Vietnam", population: 9077158, isCapital: false },
    { name: "Hanoi", country: "Vietnam", population: 8053663, isCapital: true },
    { name: "Phnom Penh", country: "Cambodia", population: 2281951, isCapital: true },
  ],
  [8]: [
    { name: "Singapore", country: "Singapore", population: 5453600, isCapital: true },
    { name: "Beijing", country: "China", population: 21542000, isCapital: true },
    { name: "Shanghai", country: "China", population: 24870895, isCapital: false },
    { name: "Hong Kong", country: "China", population: 7482500, isCapital: false },
    { name: "Manila", country: "Philippines", population: 1780148, isCapital: true },
    { name: "Kuala Lumpur", country: "Malaysia", population: 1768000, isCapital: true },
  ],
  [9]: [
    { name: "Tokyo", country: "Japan", population: 37274000, isCapital: true },
    { name: "Seoul", country: "South Korea", population: 9720846, isCapital: true },
    { name: "Pyongyang", country: "North Korea", population: 3038000, isCapital: true },
    { name: "Osaka", country: "Japan", population: 2691185, isCapital: false },
    { name: "Yokohama", country: "Japan", population: 3777491, isCapital: false },
  ],
  [10]: [
    { name: "Sydney", country: "Australia", population: 5312163, isCapital: false },
    { name: "Melbourne", country: "Australia", population: 5078193, isCapital: false },
    { name: "Brisbane", country: "Australia", population: 2560720, isCapital: false },
    { name: "Canberra", country: "Australia", population: 431380, isCapital: true },
    { name: "Port Moresby", country: "Papua New Guinea", population: 383000, isCapital: true },
  ],
  [11]: [
    { name: "Nouméa", country: "New Caledonia", population: 198000, isCapital: true },
    { name: "Honiara", country: "Solomon Islands", population: 84520, isCapital: true },
    { name: "Vanuatu", country: "Vanuatu", population: 51437, isCapital: true },
  ],
}

export function getCitiesForTimezone(offset: number): CityInfo[] {
  return TIMEZONE_CITIES[offset] || []
}
