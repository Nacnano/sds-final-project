/**
 * Mock Location Database
 * Contains common Thai locations with their coordinates for demo purposes
 */

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
  province?: string;
  aliases?: string[];
}

export const MOCK_LOCATIONS: LocationData[] = [
  // Bangkok
  {
    name: 'Erawan Shrine',
    lat: 13.7447,
    lng: 100.5396,
    province: 'Bangkok',
    aliases: ['ศาลพระพรหม', '494 Ratchadamri Rd, Pathum Wan, Bangkok 10330'],
  },
  {
    name: 'Wat Phra Kaew',
    lat: 13.7516,
    lng: 100.4927,
    province: 'Bangkok',
    aliases: [
      'Temple of the Emerald Buddha',
      'วัดพระแก้ว',
      'Na Phra Lan Rd, Phra Nakhon, Bangkok 10200',
    ],
  },
  {
    name: 'Wat Arun',
    lat: 13.7437,
    lng: 100.4889,
    province: 'Bangkok',
    aliases: [
      'Temple of Dawn',
      'วัดอรุณ',
      '158 Thanon Wang Doem, Wat Arun, Bangkok Yai, Bangkok 10600',
    ],
  },
  {
    name: 'Wat Pho',
    lat: 13.7465,
    lng: 100.4927,
    province: 'Bangkok',
    aliases: [
      'Temple of the Reclining Buddha',
      'วัดโพธิ์',
      '2 Sanam Chai Rd, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200',
    ],
  },
  {
    name: 'Golden Mount',
    lat: 13.7549,
    lng: 100.5059,
    province: 'Bangkok',
    aliases: [
      'Wat Saket',
      'วัดสระเกศ',
      'Phu Khao Thong',
      '344 Thanon Chakkraphatdi Phong, Ban Bat, Pom Prap Sattru Phai, Bangkok 10100',
    ],
  },
  {
    name: 'Lak Mueang',
    lat: 13.7502,
    lng: 100.4934,
    province: 'Bangkok',
    aliases: [
      'City Pillar Shrine',
      'หลักเมือง',
      'Sanam Chai Rd, Phra Nakhon, Bangkok 10200',
    ],
  },
  {
    name: 'Wat Benchamabophit',
    lat: 13.7669,
    lng: 100.5152,
    province: 'Bangkok',
    aliases: [
      'Marble Temple',
      'วัดเบญจมบพิตร',
      '69 Thanon Si Ayutthaya, Dusit, Bangkok 10300',
    ],
  },
  {
    name: 'Trimurti Shrine',
    lat: 13.7474,
    lng: 100.5407,
    province: 'Bangkok',
    aliases: [
      'ศาลพระตรีมูรติ',
      'Central World, Rama I Rd, Pathum Wan, Bangkok 10330',
    ],
  },

  // Chiang Mai
  {
    name: 'Wat Phra That Doi Suthep',
    lat: 18.8047,
    lng: 98.9217,
    province: 'Chiang Mai',
    aliases: [
      'Doi Suthep',
      'วัดพระธาตุดอยสุเทพ',
      '9 Moo 9 Sriwichai Alley, Tambon Su Thep, Chiang Mai 50200',
    ],
  },
  {
    name: 'Wat Chedi Luang',
    lat: 18.787,
    lng: 98.9873,
    province: 'Chiang Mai',
    aliases: [
      'วัดเจดีย์หลวง',
      '103 Phra Pok Klao Rd, Phra Sing, Mueang Chiang Mai, Chiang Mai 50200',
    ],
  },
  {
    name: 'Wat Phra Singh',
    lat: 18.7888,
    lng: 98.9817,
    province: 'Chiang Mai',
    aliases: [
      'วัดพระสิงห์',
      '2 Samlarn Rd, Phra Sing, Mueang Chiang Mai, Chiang Mai 50200',
    ],
  },

  // Phuket
  {
    name: 'Big Buddha',
    lat: 7.8913,
    lng: 98.3075,
    province: 'Phuket',
    aliases: [
      'Phra Phutta Ming Mongkol Akenakkiri',
      'พระพุทธมิ่งมงคลเอกนาคคีรี',
      'Karon, Mueang Phuket, Phuket 83100',
    ],
  },
  {
    name: 'Wat Chalong',
    lat: 7.8906,
    lng: 98.3468,
    province: 'Phuket',
    aliases: [
      'วัดฉลอง',
      '70 Chao Fah Tawan Tok Rd, Chalong, Mueang Phuket, Phuket 83130',
    ],
  },

  // Ayutthaya
  {
    name: 'Wat Mahathat',
    lat: 14.357,
    lng: 100.568,
    province: 'Ayutthaya',
    aliases: [
      'วัดมหาธาตุ',
      'Ayutthaya Historical Park, Tha Wasukri, Phra Nakhon Si Ayutthaya 13000',
    ],
  },
  {
    name: 'Wat Phra Si Sanphet',
    lat: 14.3571,
    lng: 100.5589,
    province: 'Ayutthaya',
    aliases: ['วัดพระศรีสรรเพชญ์', 'Pratuchai, Phra Nakhon Si Ayutthaya 13000'],
  },

  // Generic Bangkok Areas
  {
    name: 'Siam',
    lat: 13.7465,
    lng: 100.5346,
    province: 'Bangkok',
    aliases: ['Siam Square', 'สยาม'],
  },
  {
    name: 'Sukhumvit',
    lat: 13.7367,
    lng: 100.5618,
    province: 'Bangkok',
    aliases: ['สุขุมวิท'],
  },
  {
    name: 'Chatuchak',
    lat: 13.7997,
    lng: 100.5501,
    province: 'Bangkok',
    aliases: ['จตุจักร', 'JJ Market'],
  },
];

/**
 * Calculate Levenshtein distance (edit distance) between two strings
 * Returns the minimum number of edits needed to transform one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0 to 1)
 * 1 means identical, 0 means completely different
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  if (maxLength === 0) return 1;

  return 1 - distance / maxLength;
}

/**
 * Search for a location by name or address with fuzzy matching
 * Returns the first matching location, including misspelled names
 */
export function findLocationByName(searchTerm: string): LocationData | null {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const FUZZY_MATCH_THRESHOLD = 0.7; // 70% similarity required

  // Try exact match first
  let location = MOCK_LOCATIONS.find(
    (loc) => loc.name.toLowerCase() === normalizedSearch,
  );

  if (location) return location;

  // Try partial match on name
  location = MOCK_LOCATIONS.find((loc) =>
    loc.name.toLowerCase().includes(normalizedSearch),
  );

  if (location) return location;

  // Try matching aliases
  location = MOCK_LOCATIONS.find((loc) =>
    loc.aliases?.some(
      (alias) =>
        alias.toLowerCase().includes(normalizedSearch) ||
        normalizedSearch.includes(alias.toLowerCase()),
    ),
  );

  if (location) return location;

  // Try fuzzy matching on name
  let bestMatch: LocationData | null = null;
  let bestScore = 0;

  for (const loc of MOCK_LOCATIONS) {
    // Check similarity with location name
    const nameScore = calculateSimilarity(
      normalizedSearch,
      loc.name.toLowerCase(),
    );

    if (nameScore > bestScore && nameScore >= FUZZY_MATCH_THRESHOLD) {
      bestScore = nameScore;
      bestMatch = loc;
    }

    // Check similarity with aliases
    if (loc.aliases) {
      for (const alias of loc.aliases) {
        const aliasScore = calculateSimilarity(
          normalizedSearch,
          alias.toLowerCase(),
        );

        if (aliasScore > bestScore && aliasScore >= FUZZY_MATCH_THRESHOLD) {
          bestScore = aliasScore;
          bestMatch = loc;
        }
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  // No match found
  return null;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Format distance in human-readable format
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Estimate duration based on distance
 * Assumes average speed of 30 km/h in city traffic
 */
export function estimateDuration(meters: number): {
  text: string;
  value: number;
} {
  const averageSpeedKmh = 30;
  const averageSpeedMs = averageSpeedKmh / 3.6; // Convert to m/s
  const seconds = Math.round(meters / averageSpeedMs);

  const minutes = Math.round(seconds / 60);

  let text: string;
  if (minutes < 60) {
    text = `${minutes} mins`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    text =
      remainingMinutes > 0
        ? `${hours} hr ${remainingMinutes} mins`
        : `${hours} hr`;
  }

  return {
    text,
    value: seconds,
  };
}
