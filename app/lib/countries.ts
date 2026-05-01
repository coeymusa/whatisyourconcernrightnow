// Comprehensive list of countries we surface in the UI.
// `lat`/`lon` are approximate centroids (population-weighted where reasonable,
// geographic where not). `m49` is the UN numeric code that matches the
// world-atlas topojson `id` field.
export type Country = {
  code: string; // ISO-2
  name: string;
  lat: number;
  lon: number;
  m49?: string;
  // half-spread (degrees) used when scattering plotted dots around the
  // country so big countries don't pile every voice on the centroid.
  // Optional; tiny countries get a small default.
  spread?: { lon: number; lat: number };
};

export const COUNTRIES: Country[] = [
  // North America
  { code: "US", name: "United States", lat: 39.8, lon: -98.6, m49: "840", spread: { lon: 22, lat: 8 } },
  { code: "CA", name: "Canada", lat: 56.1, lon: -106.3, m49: "124", spread: { lon: 30, lat: 10 } },
  { code: "MX", name: "Mexico", lat: 23.6, lon: -102.5, m49: "484", spread: { lon: 9, lat: 5 } },
  { code: "GL", name: "Greenland", lat: 71.7, lon: -42.6, m49: "304" },
  { code: "CU", name: "Cuba", lat: 21.5, lon: -77.8, m49: "192" },
  { code: "HT", name: "Haiti", lat: 18.9, lon: -72.3, m49: "332" },
  { code: "DO", name: "Dominican Republic", lat: 18.7, lon: -70.2, m49: "214" },
  { code: "JM", name: "Jamaica", lat: 18.1, lon: -77.3, m49: "388" },
  { code: "BS", name: "Bahamas", lat: 25.0, lon: -77.4, m49: "044" },
  { code: "PR", name: "Puerto Rico", lat: 18.2, lon: -66.6, m49: "630" },
  { code: "TT", name: "Trinidad and Tobago", lat: 10.7, lon: -61.2, m49: "780" },
  { code: "GT", name: "Guatemala", lat: 15.8, lon: -90.2, m49: "320" },
  { code: "HN", name: "Honduras", lat: 15.2, lon: -86.2, m49: "340" },
  { code: "SV", name: "El Salvador", lat: 13.8, lon: -88.9, m49: "222" },
  { code: "NI", name: "Nicaragua", lat: 12.9, lon: -85.2, m49: "558" },
  { code: "CR", name: "Costa Rica", lat: 9.7, lon: -84.0, m49: "188" },
  { code: "PA", name: "Panama", lat: 8.5, lon: -80.8, m49: "591" },
  { code: "BZ", name: "Belize", lat: 17.2, lon: -88.5, m49: "084" },

  // South America
  { code: "BR", name: "Brazil", lat: -14.2, lon: -51.9, m49: "076", spread: { lon: 14, lat: 12 } },
  { code: "AR", name: "Argentina", lat: -38.4, lon: -63.6, m49: "032", spread: { lon: 8, lat: 12 } },
  { code: "CL", name: "Chile", lat: -35.7, lon: -71.5, m49: "152" },
  { code: "CO", name: "Colombia", lat: 4.6, lon: -74.3, m49: "170" },
  { code: "PE", name: "Peru", lat: -9.2, lon: -75.0, m49: "604" },
  { code: "VE", name: "Venezuela", lat: 6.4, lon: -66.6, m49: "862" },
  { code: "BO", name: "Bolivia", lat: -16.3, lon: -63.6, m49: "068" },
  { code: "EC", name: "Ecuador", lat: -1.8, lon: -78.2, m49: "218" },
  { code: "PY", name: "Paraguay", lat: -23.4, lon: -58.4, m49: "600" },
  { code: "UY", name: "Uruguay", lat: -32.5, lon: -55.8, m49: "858" },
  { code: "GY", name: "Guyana", lat: 4.9, lon: -58.9, m49: "328" },
  { code: "SR", name: "Suriname", lat: 3.9, lon: -56.0, m49: "740" },
  { code: "GF", name: "French Guiana", lat: 4.0, lon: -53.0, m49: "254" },
  { code: "FK", name: "Falkland Islands", lat: -51.7, lon: -59.5, m49: "238" },

  // Western & Northern Europe
  { code: "GB", name: "United Kingdom", lat: 55.4, lon: -3.4, m49: "826" },
  { code: "IE", name: "Ireland", lat: 53.4, lon: -8.2, m49: "372" },
  { code: "FR", name: "France", lat: 46.2, lon: 2.2, m49: "250" },
  { code: "DE", name: "Germany", lat: 51.2, lon: 10.5, m49: "276" },
  { code: "ES", name: "Spain", lat: 40.5, lon: -3.7, m49: "724" },
  { code: "PT", name: "Portugal", lat: 39.4, lon: -8.2, m49: "620" },
  { code: "IT", name: "Italy", lat: 41.9, lon: 12.6, m49: "380" },
  { code: "NL", name: "Netherlands", lat: 52.1, lon: 5.3, m49: "528" },
  { code: "BE", name: "Belgium", lat: 50.5, lon: 4.5, m49: "056" },
  { code: "CH", name: "Switzerland", lat: 46.8, lon: 8.2, m49: "756" },
  { code: "AT", name: "Austria", lat: 47.5, lon: 14.6, m49: "040" },
  { code: "LU", name: "Luxembourg", lat: 49.8, lon: 6.1, m49: "442" },
  { code: "LI", name: "Liechtenstein", lat: 47.2, lon: 9.6, m49: "438" },
  { code: "MC", name: "Monaco", lat: 43.7, lon: 7.4, m49: "492" },
  { code: "AD", name: "Andorra", lat: 42.5, lon: 1.5, m49: "020" },
  { code: "SM", name: "San Marino", lat: 43.9, lon: 12.5, m49: "674" },
  { code: "VA", name: "Vatican City", lat: 41.9, lon: 12.5, m49: "336" },
  { code: "MT", name: "Malta", lat: 35.9, lon: 14.5, m49: "470" },

  // Nordics
  { code: "SE", name: "Sweden", lat: 60.1, lon: 18.6, m49: "752" },
  { code: "NO", name: "Norway", lat: 60.5, lon: 8.5, m49: "578" },
  { code: "DK", name: "Denmark", lat: 56.3, lon: 9.5, m49: "208" },
  { code: "FI", name: "Finland", lat: 61.9, lon: 25.7, m49: "246" },
  { code: "IS", name: "Iceland", lat: 64.9, lon: -19.0, m49: "352" },

  // Eastern Europe / Baltics / Balkans
  { code: "PL", name: "Poland", lat: 51.9, lon: 19.1, m49: "616" },
  { code: "CZ", name: "Czechia", lat: 49.8, lon: 15.5, m49: "203" },
  { code: "SK", name: "Slovakia", lat: 48.7, lon: 19.7, m49: "703" },
  { code: "HU", name: "Hungary", lat: 47.2, lon: 19.5, m49: "348" },
  { code: "SI", name: "Slovenia", lat: 46.2, lon: 14.8, m49: "705" },
  { code: "HR", name: "Croatia", lat: 45.1, lon: 15.2, m49: "191" },
  { code: "BA", name: "Bosnia and Herzegovina", lat: 43.9, lon: 17.7, m49: "070" },
  { code: "RS", name: "Serbia", lat: 44.0, lon: 21.0, m49: "688" },
  { code: "ME", name: "Montenegro", lat: 42.7, lon: 19.4, m49: "499" },
  { code: "AL", name: "Albania", lat: 41.2, lon: 20.2, m49: "008" },
  { code: "MK", name: "North Macedonia", lat: 41.6, lon: 21.7, m49: "807" },
  { code: "XK", name: "Kosovo", lat: 42.6, lon: 21.0 },
  { code: "BG", name: "Bulgaria", lat: 42.7, lon: 25.5, m49: "100" },
  { code: "GR", name: "Greece", lat: 39.1, lon: 21.8, m49: "300" },
  { code: "RO", name: "Romania", lat: 45.9, lon: 24.9, m49: "642" },
  { code: "MD", name: "Moldova", lat: 47.4, lon: 28.4, m49: "498" },
  { code: "UA", name: "Ukraine", lat: 48.4, lon: 31.2, m49: "804" },
  { code: "BY", name: "Belarus", lat: 53.7, lon: 27.9, m49: "112" },
  { code: "RU", name: "Russia", lat: 55.8, lon: 56.6, m49: "643", spread: { lon: 50, lat: 10 } },
  { code: "EE", name: "Estonia", lat: 58.6, lon: 25.0, m49: "233" },
  { code: "LT", name: "Lithuania", lat: 55.2, lon: 23.9, m49: "440" },
  { code: "LV", name: "Latvia", lat: 56.9, lon: 24.6, m49: "428" },

  // Middle East / North Africa
  { code: "TR", name: "Türkiye", lat: 38.9, lon: 35.2, m49: "792" },
  { code: "CY", name: "Cyprus", lat: 35.1, lon: 33.4, m49: "196" },
  { code: "IL", name: "Israel", lat: 31.0, lon: 34.9, m49: "376" },
  { code: "PS", name: "Palestine", lat: 31.9, lon: 35.2, m49: "275" },
  { code: "LB", name: "Lebanon", lat: 33.8, lon: 35.9, m49: "422" },
  { code: "JO", name: "Jordan", lat: 30.6, lon: 36.2, m49: "400" },
  { code: "SY", name: "Syria", lat: 34.8, lon: 38.9, m49: "760" },
  { code: "IQ", name: "Iraq", lat: 33.2, lon: 43.7, m49: "368" },
  { code: "IR", name: "Iran", lat: 32.4, lon: 53.7, m49: "364" },
  { code: "AF", name: "Afghanistan", lat: 33.9, lon: 67.7, m49: "004" },
  { code: "SA", name: "Saudi Arabia", lat: 23.9, lon: 45.1, m49: "682" },
  { code: "AE", name: "United Arab Emirates", lat: 23.4, lon: 53.8, m49: "784" },
  { code: "QA", name: "Qatar", lat: 25.4, lon: 51.2, m49: "634" },
  { code: "BH", name: "Bahrain", lat: 26.0, lon: 50.6, m49: "048" },
  { code: "KW", name: "Kuwait", lat: 29.3, lon: 47.5, m49: "414" },
  { code: "OM", name: "Oman", lat: 21.5, lon: 55.9, m49: "512" },
  { code: "YE", name: "Yemen", lat: 15.6, lon: 48.5, m49: "887" },
  { code: "EG", name: "Egypt", lat: 26.8, lon: 30.8, m49: "818" },
  { code: "LY", name: "Libya", lat: 26.3, lon: 17.2, m49: "434" },
  { code: "TN", name: "Tunisia", lat: 33.9, lon: 9.5, m49: "788" },
  { code: "DZ", name: "Algeria", lat: 28.0, lon: 1.7, m49: "012", spread: { lon: 8, lat: 6 } },
  { code: "MA", name: "Morocco", lat: 31.8, lon: -7.1, m49: "504" },
  { code: "EH", name: "Western Sahara", lat: 24.2, lon: -12.9, m49: "732" },

  // Sub-Saharan Africa
  { code: "MR", name: "Mauritania", lat: 21.0, lon: -10.9, m49: "478" },
  { code: "ML", name: "Mali", lat: 17.6, lon: -4.0, m49: "466" },
  { code: "NE", name: "Niger", lat: 17.6, lon: 8.1, m49: "562" },
  { code: "TD", name: "Chad", lat: 15.5, lon: 18.7, m49: "148" },
  { code: "SD", name: "Sudan", lat: 12.9, lon: 30.2, m49: "729" },
  { code: "SS", name: "South Sudan", lat: 6.9, lon: 31.3, m49: "728" },
  { code: "ER", name: "Eritrea", lat: 15.2, lon: 39.8, m49: "232" },
  { code: "DJ", name: "Djibouti", lat: 11.8, lon: 42.6, m49: "262" },
  { code: "SO", name: "Somalia", lat: 5.2, lon: 46.2, m49: "706" },
  { code: "ET", name: "Ethiopia", lat: 9.1, lon: 40.5, m49: "231" },
  { code: "KE", name: "Kenya", lat: -0.0, lon: 37.9, m49: "404" },
  { code: "UG", name: "Uganda", lat: 1.4, lon: 32.3, m49: "800" },
  { code: "RW", name: "Rwanda", lat: -2.0, lon: 29.9, m49: "646" },
  { code: "BI", name: "Burundi", lat: -3.4, lon: 29.9, m49: "108" },
  { code: "TZ", name: "Tanzania", lat: -6.4, lon: 34.9, m49: "834" },
  { code: "MZ", name: "Mozambique", lat: -18.7, lon: 35.5, m49: "508" },
  { code: "MG", name: "Madagascar", lat: -18.8, lon: 46.9, m49: "450" },
  { code: "MW", name: "Malawi", lat: -13.3, lon: 34.3, m49: "454" },
  { code: "ZM", name: "Zambia", lat: -13.1, lon: 27.9, m49: "894" },
  { code: "ZW", name: "Zimbabwe", lat: -19.0, lon: 29.2, m49: "716" },
  { code: "BW", name: "Botswana", lat: -22.3, lon: 24.7, m49: "072" },
  { code: "NA", name: "Namibia", lat: -22.6, lon: 17.1, m49: "516" },
  { code: "AO", name: "Angola", lat: -11.2, lon: 17.9, m49: "024" },
  { code: "CD", name: "DR Congo", lat: -4.0, lon: 21.8, m49: "180" },
  { code: "CG", name: "Republic of the Congo", lat: -0.2, lon: 15.8, m49: "178" },
  { code: "GA", name: "Gabon", lat: -0.8, lon: 11.6, m49: "266" },
  { code: "GQ", name: "Equatorial Guinea", lat: 1.6, lon: 10.3, m49: "226" },
  { code: "CM", name: "Cameroon", lat: 7.4, lon: 12.4, m49: "120" },
  { code: "CF", name: "Central African Republic", lat: 6.6, lon: 20.9, m49: "140" },
  { code: "NG", name: "Nigeria", lat: 9.1, lon: 8.7, m49: "566" },
  { code: "BJ", name: "Benin", lat: 9.3, lon: 2.3, m49: "204" },
  { code: "TG", name: "Togo", lat: 8.6, lon: 0.8, m49: "768" },
  { code: "GH", name: "Ghana", lat: 7.9, lon: -1.0, m49: "288" },
  { code: "CI", name: "Côte d'Ivoire", lat: 7.5, lon: -5.5, m49: "384" },
  { code: "BF", name: "Burkina Faso", lat: 12.2, lon: -1.6, m49: "854" },
  { code: "LR", name: "Liberia", lat: 6.4, lon: -9.4, m49: "430" },
  { code: "SL", name: "Sierra Leone", lat: 8.5, lon: -11.8, m49: "694" },
  { code: "GN", name: "Guinea", lat: 9.9, lon: -9.7, m49: "324" },
  { code: "GW", name: "Guinea-Bissau", lat: 11.8, lon: -15.2, m49: "624" },
  { code: "SN", name: "Senegal", lat: 14.5, lon: -14.5, m49: "686" },
  { code: "GM", name: "Gambia", lat: 13.4, lon: -15.4, m49: "270" },
  { code: "ZA", name: "South Africa", lat: -30.6, lon: 22.9, m49: "710", spread: { lon: 6, lat: 4 } },
  { code: "LS", name: "Lesotho", lat: -29.6, lon: 28.2, m49: "426" },
  { code: "SZ", name: "Eswatini", lat: -26.5, lon: 31.5, m49: "748" },

  // South & Central Asia
  { code: "KZ", name: "Kazakhstan", lat: 48.0, lon: 66.9, m49: "398", spread: { lon: 16, lat: 4 } },
  { code: "UZ", name: "Uzbekistan", lat: 41.4, lon: 64.6, m49: "860" },
  { code: "TM", name: "Turkmenistan", lat: 38.9, lon: 59.6, m49: "795" },
  { code: "KG", name: "Kyrgyzstan", lat: 41.2, lon: 74.8, m49: "417" },
  { code: "TJ", name: "Tajikistan", lat: 38.9, lon: 71.3, m49: "762" },
  { code: "MN", name: "Mongolia", lat: 46.9, lon: 103.8, m49: "496" },
  { code: "PK", name: "Pakistan", lat: 30.4, lon: 69.3, m49: "586" },
  { code: "IN", name: "India", lat: 22.6, lon: 78.9, m49: "356", spread: { lon: 11, lat: 9 } },
  { code: "BD", name: "Bangladesh", lat: 23.7, lon: 90.4, m49: "050" },
  { code: "LK", name: "Sri Lanka", lat: 7.9, lon: 80.8, m49: "144" },
  { code: "NP", name: "Nepal", lat: 28.4, lon: 84.1, m49: "524" },
  { code: "BT", name: "Bhutan", lat: 27.5, lon: 90.4, m49: "064" },
  { code: "MV", name: "Maldives", lat: 3.2, lon: 73.2, m49: "462" },

  // East Asia
  { code: "CN", name: "China", lat: 35.9, lon: 104.2, m49: "156", spread: { lon: 18, lat: 10 } },
  { code: "JP", name: "Japan", lat: 36.2, lon: 138.3, m49: "392" },
  { code: "KR", name: "South Korea", lat: 35.9, lon: 127.8, m49: "410" },
  { code: "KP", name: "North Korea", lat: 40.3, lon: 127.5, m49: "408" },
  { code: "TW", name: "Taiwan", lat: 23.7, lon: 121.0, m49: "158" },
  { code: "HK", name: "Hong Kong", lat: 22.3, lon: 114.2, m49: "344" },

  // SE Asia / Pacific
  { code: "PH", name: "Philippines", lat: 12.9, lon: 121.8, m49: "608" },
  { code: "VN", name: "Vietnam", lat: 14.1, lon: 108.3, m49: "704" },
  { code: "TH", name: "Thailand", lat: 15.9, lon: 101.0, m49: "764" },
  { code: "LA", name: "Laos", lat: 19.9, lon: 102.5, m49: "418" },
  { code: "KH", name: "Cambodia", lat: 12.6, lon: 104.9, m49: "116" },
  { code: "MM", name: "Myanmar", lat: 21.9, lon: 95.9, m49: "104" },
  { code: "MY", name: "Malaysia", lat: 4.2, lon: 101.9, m49: "458" },
  { code: "SG", name: "Singapore", lat: 1.35, lon: 103.8, m49: "702" },
  { code: "ID", name: "Indonesia", lat: -2.5, lon: 118.0, m49: "360", spread: { lon: 14, lat: 4 } },
  { code: "BN", name: "Brunei", lat: 4.5, lon: 114.7, m49: "096" },
  { code: "TL", name: "Timor-Leste", lat: -8.9, lon: 125.7, m49: "626" },
  { code: "PG", name: "Papua New Guinea", lat: -6.3, lon: 143.1, m49: "598" },
  { code: "FJ", name: "Fiji", lat: -17.7, lon: 178.1, m49: "242" },
  { code: "SB", name: "Solomon Islands", lat: -9.6, lon: 160.2, m49: "090" },
  { code: "VU", name: "Vanuatu", lat: -15.4, lon: 166.9, m49: "548" },
  { code: "NC", name: "New Caledonia", lat: -20.9, lon: 165.6, m49: "540" },
  { code: "WS", name: "Samoa", lat: -13.8, lon: -172.1, m49: "882" },
  { code: "TO", name: "Tonga", lat: -21.2, lon: -175.2, m49: "776" },
  { code: "AU", name: "Australia", lat: -25.3, lon: 133.8, m49: "036", spread: { lon: 16, lat: 10 } },
  { code: "NZ", name: "New Zealand", lat: -40.9, lon: 174.9, m49: "554" },

  // Antarctica
  { code: "AQ", name: "Antarctica", lat: -82.0, lon: 0.0, m49: "010" },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));
const BY_M49 = new Map(
  COUNTRIES.filter((c) => c.m49).map((c) => [c.m49!, c]),
);

export function findCountry(code: string): Country | undefined {
  return BY_CODE.get(code);
}

export function findByM49(m49: string): Country | undefined {
  return BY_M49.get(m49.padStart(3, "0"));
}
