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
  {
    name: 'ICONSIAM',
    lat: 13.7267,
    lng: 100.5109,
    province: 'Bangkok',
    aliases: [
      'ไอคอนสยาม',
      '299 Charoen Nakhon Rd, Khlong Ton Sai, Khlong San, Bangkok 10600',
    ],
  },
  {
    name: 'King Power Mahanakhon',
    lat: 13.7230,
    lng: 100.5282,
    province: 'Bangkok',
    aliases: [
      'Mahanakhon Tower',
      'Mahanakhon SkyWalk',
      'ตึกมหานคร',
      '114 Naradhiwas Rajanagarindra Rd, Silom, Bang Rak, Bangkok 10500',
    ],
  },
  {
    name: 'The Giant Swing',
    lat: 13.7518,
    lng: 100.5016,
    province: 'Bangkok',
    aliases: [
      'Sao Ching Cha',
      'เสาชิงช้า',
      'Dinso Rd, Sao Chingcha, Phra Nakhon, Bangkok 10200',
    ],
  },
  {
    name: 'Jim Thompson House',
    lat: 13.7492,
    lng: 100.5283,
    province: 'Bangkok',
    aliases: [
      'Jim Thompson House Museum',
      'พิพิธภัณฑ์บ้านจิม ทอมป์สัน',
      '6 Soi Kasemsan 2, Rama 1 Rd, Pathum Wan, Bangkok 10330',
    ],
  },
  {
    name: 'Wat Traimit',
    lat: 13.7377,
    lng: 100.5136,
    province: 'Bangkok',
    aliases: [
      'Temple of the Golden Buddha',
      'วัดไตรมิตร',
      '661 Charoen Krung Rd, Talat Noi, Samphanthawong, Bangkok 10100',
    ],
  },
  {
    name: 'Bangkok Art and Culture Centre',
    lat: 13.7466,
    lng: 100.5303,
    province: 'Bangkok',
    aliases: [
      'BACC',
      'หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร',
      '939 Rama I Rd, Wang Mai, Pathum Wan, Bangkok 10330',
    ],
  },
  {
    name: 'Rama VIII Bridge',
    lat: 13.7692,
    lng: 100.4984,
    province: 'Bangkok',
    aliases: [
      'Saphan Rama 8',
      'สะพานพระราม 8',
      'Bang Yi Khan, Bang Phlat, Bangkok 10700',
    ],
  },

  // Popular Areas & Streets
  {
    name: 'Khao San Road',
    lat: 13.7588,
    lng: 100.4974,
    province: 'Bangkok',
    aliases: [
      'Thanon Khao San',
      'ถนนข้าวสาร',
      'Talat Yot, Phra Nakhon, Bangkok 10200',
    ],
  },
  {
    name: 'Yaowarat Road (Chinatown)',
    lat: 13.7413,
    lng: 100.5083,
    province: 'Bangkok',
    aliases: [
      'Chinatown Bangkok',
      'เยาวราช',
      'Samphanthawong, Bangkok 10100',
    ],
  },
  {
    name: 'Asiatique The Riverfront',
    lat: 13.7029,
    lng: 100.5037,
    province: 'Bangkok',
    aliases: [
      'เอเชียทีค',
      '2194 Charoen Krung Rd, Wat Phraya Krai, Bang Kho Laem, Bangkok 10120',
    ],
  },

  // Shopping Malls
  {
    name: 'Siam Paragon',
    lat: 13.7461,
    lng: 100.5349,
    province: 'Bangkok',
    aliases: [
      'สยามพารากอน',
      '991 Rama I Rd, Pathum Wan, Bangkok 10330',
    ],
  },
  {
    name: 'CentralWorld',
    lat: 13.7466,
    lng: 100.5393,
    province: 'Bangkok',
    aliases: [
      'เซ็นทรัลเวิลด์',
      '999/9 Rama I Rd, Pathum Wan, Bangkok 10330',
    ],
  },
  {
    name: 'MBK Center',
    lat: 13.7443,
    lng: 100.5293,
    province: 'Bangkok',
    aliases: [
      'Ma Boon Khrong',
      'เอ็มบีเค เซ็นเตอร์',
      '444 Phaya Thai Rd, Wang Mai, Pathum Wan, Bangkok 10330',
    ],
  },
  {
    name: 'Terminal 21 Asok',
    lat: 13.7376,
    lng: 100.5604,
    province: 'Bangkok',
    aliases: [
      'เทอร์มินอล 21 อโศก',
      '88 Soi Sukhumvit 19, Khlong Toei Nuea, Watthana, Bangkok 10110',
    ],
  },
  {
    name: 'Platinum Fashion Mall',
    lat: 13.7500,
    lng: 100.5397,
    province: 'Bangkok',
    aliases: [
      'The Platinum',
      'แพลทินัม',
      '222 Phetchaburi Rd, Thanon Phetchaburi, Ratchathewi, Bangkok 10400',
    ],
  },

  // Parks
  {
    name: 'Lumpini Park',
    lat: 13.7314,
    lng: 100.5417,
    province: 'Bangkok',
    aliases: [
      'Suan Lumpini',
      'สวนลุมพินี',
      'Rama IV Rd, Lumphini, Pathum Wan, Bangkok 10330',
    ],
  },
  {
    name: 'Benjakitti Park',
    lat: 13.7303,
    lng: 100.5573,
    province: 'Bangkok',
    aliases: [
      'Suan Benjakitti',
      'สวนเบญจกิติ',
      'Ratchadaphisek Rd, Khlong Toei, Bangkok 10110',
    ],
  },

  // Transport Hubs
  {
    name: 'Krung Thep Aphiwat Central Terminal',
    lat: 13.8037,
    lng: 100.5403,
    province: 'Bangkok',
    aliases: [
      'Bang Sue Grand Station',
      'สถานีกลางกรุงเทพอภิวัฒน์',
      'Chatuchak, Bangkok 10900',
    ],
  },
  {
    name: 'Don Mueang International Airport',
    lat: 13.9126,
    lng: 100.6067,
    province: 'Bangkok',
    aliases: [
      'DMK',
      'สนามบินดอนเมือง',
      '222 Vibhavadi Rangsit Rd, Sanambin, Don Mueang, Bangkok 10210',
    ],
  },
  {
    name: 'Victory Monument',
    lat: 13.7649,
    lng: 100.5382,
    province: 'Bangkok',
    aliases: [
      'Anusawari Chai Samoraphum',
      'อนุสาวรีย์ชัยสมรภูมิ',
      'Phaya Thai, Ratchathewi, Bangkok 10400',
    ],
  },
  // --- NEW ADDITIONS: Shopping & Lifestyle ---
  {
    name: 'EmQuartier',
    lat: 13.7320,
    lng: 100.5698,
    province: 'Bangkok',
    aliases: ['The EmQuartier', 'เอ็มควอเทียร์', '693 Sukhumvit Rd, Khlong Tan Nuea, Watthana, Bangkok 10110'],
  },
  {
    name: 'Central Embassy',
    lat: 13.7436,
    lng: 100.5463,
    province: 'Bangkok',
    aliases: ['เซ็นทรัล เอ็มบาสซี', '1031 Phloen Chit Rd, Lumphini, Pathum Wan, Bangkok 10330'],
  },
  {
    name: 'Central Plaza Ladprao',
    lat: 13.8165,
    lng: 100.5605,
    province: 'Bangkok',
    aliases: ['Central Ladprao', 'เซ็นทรัล ลาดพร้าว', '1693 Phahonyothin Rd, Chatuchak, Bangkok 10900'],
  },
  {
    name: 'Union Mall',
    lat: 13.8135,
    lng: 100.5612,
    province: 'Bangkok',
    aliases: ['ยูเนี่ยน มอลล์', '54 Soi Lat Phrao 1, Chom Phon, Chatuchak, Bangkok 10900'],
  },
  {
    name: 'Samyan Mitrtown',
    lat: 13.7335,
    lng: 100.5285,
    province: 'Bangkok',
    aliases: ['สามย่าน มิตรทาวน์', '944 Rama IV Rd, Wang Mai, Pathum Wan, Bangkok 10330'],
  },
  {
    name: 'Siam Discovery',
    lat: 13.7465,
    lng: 100.5314,
    province: 'Bangkok',
    aliases: ['สยามดิสคัฟเวอรี', '989 Rama I Rd, Pathum Wan, Bangkok 10330'],
  },
  {
    name: 'Mega Bangna',
    lat: 13.6465,
    lng: 100.6802,
    province: 'Samut Prakan',
    aliases: ['เมกาบางนา', '39 Moo 6 Bang Na-Trat Rd, Bang Kaeo, Bang Phli, Samut Prakan 10540'],
  },
  {
    name: 'The Commons Thonglor',
    lat: 13.7347,
    lng: 100.5826,
    province: 'Bangkok',
    aliases: ['เดอะคอมมอนส์ ทองหล่อ', '335 Thong Lo 17 Alley, Khlong Tan Nuea, Watthana, Bangkok 10110'],
  },
  {
    name: 'River City Bangkok',
    lat: 13.7300,
    lng: 100.5138,
    province: 'Bangkok',
    aliases: ['ริเวอร์ ซิตี้', '23 Soi Charoen Krung 24, Talat Noi, Samphanthawong, Bangkok 10100'],
  },

  // --- NEW ADDITIONS: Markets (Night & Day) ---
  {
    name: 'Jodd Fairs Rama 9',
    lat: 13.7568,
    lng: 100.5667,
    province: 'Bangkok',
    aliases: ['จ๊อดแฟร์', 'Rama IX Rd, Huai Khwang, Bangkok 10310'],
  },
  {
    name: 'Train Night Market Srinakarin',
    lat: 13.6928,
    lng: 100.6505,
    province: 'Bangkok',
    aliases: ['Talat Rot Fai', 'ตลาดนัดรถไฟ ศรีนครินทร์', 'Soi Srinakarin 51, Nong Bon, Prawet, Bangkok 10250'],
  },
  {
    name: 'Pak Khlong Talat',
    lat: 13.7412,
    lng: 100.4983,
    province: 'Bangkok',
    aliases: ['Flower Market', 'ปากคลองตลาด', 'Chakkraphet Rd, Wang Burapha Phirom, Phra Nakhon, Bangkok 10200'],
  },
  {
    name: 'Or Tor Kor Market',
    lat: 13.7975,
    lng: 100.5487,
    province: 'Bangkok',
    aliases: ['ตลาด อ.ต.ก.', '101 Kamphaeng Phet Rd, Chatuchak, Bangkok 10900'],
  },
  {
    name: 'Wang Lang Market',
    lat: 13.7552,
    lng: 100.4855,
    province: 'Bangkok',
    aliases: ['ตลาดวังหลัง', 'Prannok Rd, Siriraj, Bangkok Noi, Bangkok 10700'],
  },
  {
    name: 'Khlong Lat Mayom Floating Market',
    lat: 13.7618,
    lng: 100.4153,
    province: 'Bangkok',
    aliases: ['ตลาดน้ำคลองลัดมะยม', '15 30/1 Bang Ramat Rd, Bang Ramat, Taling Chan, Bangkok 10170'],
  },
  {
    name: 'Taling Chan Floating Market',
    lat: 13.7912,
    lng: 100.4579,
    province: 'Bangkok',
    aliases: ['ตลาดน้ำตลิ่งชัน', '333 Chak Phra Rd, Khlong Chak Phra, Taling Chan, Bangkok 10170'],
  },

  // --- NEW ADDITIONS: Culture & Religion ---
  {
    name: 'Wat Paknam Phasi Charoen',
    lat: 13.7217,
    lng: 100.4702,
    province: 'Bangkok',
    aliases: ['Big Buddha Bangkok', 'วัดปากน้ำ ภาษีเจริญ', '300 Ratchamongkhon Prasat Alley, Pak Khlong Phasi Charoen, Phasi Charoen, Bangkok 10160'],
  },
  {
    name: 'National Museum Bangkok',
    lat: 13.7587,
    lng: 100.4922,
    province: 'Bangkok',
    aliases: ['พิพิธภัณฑสถานแห่งชาติ พระนคร', '4 Na Phra That Alley, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200'],
  },
  {
    name: 'Wat Suthat',
    lat: 13.7510,
    lng: 100.5010,
    province: 'Bangkok',
    aliases: ['The Giant Swing Temple', 'วัดสุทัศนเทพวราราม', '146 Bamrung Mueang Rd, Wat Ratchabophit, Phra Nakhon, Bangkok 10200'],
  },
  {
    name: 'Wat Mangkon Kamalawat',
    lat: 13.7434,
    lng: 100.5096,
    province: 'Bangkok',
    aliases: ['Wat Leng Noei Yi', 'วัดมังกรกมลาวาส', '423 Charoen Krung Rd, Pom Prap, Pom Prap Sattru Phai, Bangkok 10100'],
  },
  {
    name: 'Sri Maha Mariamman Temple',
    lat: 13.7243,
    lng: 100.5229,
    province: 'Bangkok',
    aliases: ['Wat Khaek', 'วัดพระศรีมหาอุมาเทวี (วัดแขก)', '2 Pan Rd, Silom, Bang Rak, Bangkok 10500'],
  },
  {
    name: 'Loha Prasat',
    lat: 13.7553,
    lng: 100.5042,
    province: 'Bangkok',
    aliases: ['Metal Castle', 'Wat Ratchanatdaram', 'วัดราชนัดดารามวรวิหาร', '2 Maha Chai Rd, Wat Bowon Niwet, Phra Nakhon, Bangkok 10200'],
  },
  {
    name: 'Assumption Cathedral',
    lat: 13.7232,
    lng: 100.5151,
    province: 'Bangkok',
    aliases: ['อาสนวิหารอัสสัมชัญ', '23 Oriental Ave, Bang Rak, Bangkok 10500'],
  },
  {
    name: 'Erawan Museum',
    lat: 13.6287,
    lng: 100.5888,
    province: 'Samut Prakan',
    aliases: ['พิพิธภัณฑ์ช้างเอราวัณ', '99/9 Moo 1 Bang Na-Trat Rd, Bang Mueang Mai, Mueang Samut Prakan, Samut Prakan 10270'],
  },
  {
    name: 'Ancient City',
    lat: 13.5394,
    lng: 100.6230,
    province: 'Samut Prakan',
    aliases: ['Muang Boran', 'เมืองโบราณ', '296/1 Sukhumvit Rd, Bang Pu Mai, Mueang Samut Prakan, Samut Prakan 10280'],
  },
  {
    name: 'Museum of Contemporary Art (MOCA)',
    lat: 13.8532,
    lng: 100.5625,
    province: 'Bangkok',
    aliases: ['MOCA BANGKOK', 'พิพิธภัณฑ์ศิลปะไทยร่วมสมัย', '499 Kamphaeng Phet 6 Rd, Lat Yao, Chatuchak, Bangkok 10900'],
  },

  // --- NEW ADDITIONS: Parks & Outdoors ---
  {
    name: 'Suan Luang Rama IX',
    lat: 13.6884,
    lng: 100.6640,
    province: 'Bangkok',
    aliases: ['สวนหลวง ร.9', 'Chaloem Phrakiat Ratchakan Thi 9 Rd, Nong Bon, Prawet, Bangkok 10250'],
  },
  {
    name: 'Wachirabenchathat Park',
    lat: 13.8123,
    lng: 100.5547,
    province: 'Bangkok',
    aliases: ['Suan Rot Fai', 'สวนวชิรเบญจทัศ (สวนรถไฟ)', 'Kamphaeng Phet 3 Rd, Lat Yao, Chatuchak, Bangkok 10900'],
  },
  {
    name: 'Chatuchak Park',
    lat: 13.8058,
    lng: 100.5558,
    province: 'Bangkok',
    aliases: ['สวนจตุจักร', 'Kamphaeng Phet 3 Rd, Chatuchak, Bangkok 10900'],
  },
  {
    name: 'Benjasiri Park',
    lat: 13.7308,
    lng: 100.5678,
    province: 'Bangkok',
    aliases: ['สวนเบญจสิริ', 'Sukhumvit Rd, Khlong Tan, Khlong Toei, Bangkok 10110'],
  },
  {
    name: 'Chulalongkorn University Centenary Park',
    lat: 13.7391,
    lng: 100.5245,
    province: 'Bangkok',
    aliases: ['อุทยาน 100 ปี จุฬาลงกรณ์มหาวิทยาลัย', '254 Soi Chulalongkorn 5, Wang Mai, Pathum Wan, Bangkok 10330'],
  },

  // --- NEW ADDITIONS: Landmarks & Sightseeing ---
  {
    name: 'Democracy Monument',
    lat: 13.7566,
    lng: 100.5018,
    province: 'Bangkok',
    aliases: ['อนุสาวรีย์ประชาธิปไตย', 'Ratchadamnoen Klang Rd, Wat Bowon Niwet, Phra Nakhon, Bangkok 10200'],
  },
  {
    name: 'Talad Noi',
    lat: 13.7339,
    lng: 100.5131,
    province: 'Bangkok',
    aliases: ['ตลาดน้อย', 'Talat Noi, Samphanthawong, Bangkok 10100'],
  },
  {
    name: 'Phra Sumen Fort',
    lat: 13.7635,
    lng: 100.4946,
    province: 'Bangkok',
    aliases: ['ป้อมพระสุเมรุ', 'Phra Athit Rd, Chana Songkhram, Phra Nakhon, Bangkok 10200'],
  },
  {
    name: 'Baiyoke Sky Hotel',
    lat: 13.7543,
    lng: 100.5404,
    province: 'Bangkok',
    aliases: ['ตึกใบหยก 2', '222 Ratchaprarop Rd, Thanon Phaya Thai, Ratchathewi, Bangkok 10400'],
  },
  {
    name: 'State Tower',
    lat: 13.7215,
    lng: 100.5169,
    province: 'Bangkok',
    aliases: ['Lebua at State Tower', 'ตึกสเตท ทาวเวอร์', '1055 Si Lom Rd, Silom, Bang Rak, Bangkok 10500'],
  },
  {
    name: 'Chocolate Ville',
    lat: 13.8097,
    lng: 100.6631,
    province: 'Bangkok',
    aliases: ['ชอคโกแลต วิลล์', '23 1-16 Prasert-Manukitch Rd, Ram Inthra, Khan Na Yao, Bangkok 10230'],
  },
  {
    name: 'Safari World',
    lat: 13.8651,
    lng: 100.7044,
    province: 'Bangkok',
    aliases: ['ซาฟารีเวิลด์', '99 Panya Indra Rd, Sam Wa Tawan Tok, Khlong Sam Wa, Bangkok 10510'],
  },
  {
    name: 'Siam Amazing Park',
    lat: 13.8054,
    lng: 100.6932,
    province: 'Bangkok',
    aliases: ['Siam Park City', 'สยามอะเมซิ่งพาร์ค', '203 Suan Sayam Rd, Khan Na Yao, Bangkok 10230'],
  },

  // --- NEW ADDITIONS: Sports & Events ---
  {
    name: 'Rajamangala National Stadium',
    lat: 13.7554,
    lng: 100.6223,
    province: 'Bangkok',
    aliases: ['ราชมังคลากีฬาสถาน', '286 Ramkhamhaeng Rd, Hua Mak, Bang Kapi, Bangkok 10240'],
  },
  {
    name: 'Rajadamnern Boxing Stadium',
    lat: 13.7599,
    lng: 100.5099,
    province: 'Bangkok',
    aliases: ['เวทีมวยราชดำเนิน', '8 Ratchadamnoen Nok Rd, Wat Sommanat, Pom Prap Sattru Phai, Bangkok 10100'],
  },
  {
    name: 'Queen Sirikit National Convention Center',
    lat: 13.7237,
    lng: 100.5594,
    province: 'Bangkok',
    aliases: ['QSNCC', 'ศูนย์การประชุมแห่งชาติสิริกิติ์', '60 Ratchadaphisek Rd, Khlong Toei, Bangkok 10110'],
  },

  // --- NEW ADDITIONS: Transport & Infrastructure ---
  {
    name: 'Suvarnabhumi Airport',
    lat: 13.6899,
    lng: 100.7501,
    province: 'Samut Prakan',
    aliases: ['BKK', 'ท่าอากาศยานสุวรรณภูมิ', '999 Moo 1, Nong Prue, Bang Phli, Samut Prakan 10540'],
  },
  {
    name: 'Bangkok Bus Terminal (Chatuchak)',
    lat: 13.8137,
    lng: 100.5491,
    province: 'Bangkok',
    aliases: ['Mo Chit 2', 'สถานีขนส่งผู้โดยสารกรุงเทพ (จตุจักร)', '2 Kamphaeng Phet 2 Rd, Chatuchak, Bangkok 10900'],
  },
  {
    name: 'Ekkamai Bus Terminal',
    lat: 13.7199,
    lng: 100.5840,
    province: 'Bangkok',
    aliases: ['Eastern Bus Terminal', 'สถานีขนส่งผู้โดยสารกรุงเทพ (เอกมัย)', '928 Sukhumvit Rd, Phra Khanong, Khlong Toei, Bangkok 10110'],
  },

  // --- NEW ADDITIONS: Education ---
  {
    name: 'Chulalongkorn University',
    lat: 13.7384,
    lng: 100.5322,
    province: 'Bangkok',
    aliases: ['Chula', 'จุฬาลงกรณ์มหาวิทยาลัย', '254 Phaya Thai Rd, Wang Mai, Pathum Wan, Bangkok 10330'],
  },
  {
    name: 'Thammasat University (Tha Prachan)',
    lat: 13.7567,
    lng: 100.4905,
    province: 'Bangkok',
    aliases: ['มหาวิทยาลัยธรรมศาสตร์ ท่าพระจันทร์', '2 Phra Chan Alley, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200'],
  },
  {
    name: 'Mahidol University (Siriraj)',
    lat: 13.7586,
    lng: 100.4852,
    province: 'Bangkok',
    aliases: ['Faculty of Medicine Siriraj Hospital', 'คณะแพทยศาสตร์ศิริราชพยาบาล', '2 Wanglang Rd, Siriraj, Bangkok Noi, Bangkok 10700'],
  },
  
  // --- NEW ADDITIONS: Streets & Areas ---
  {
    name: 'Thong Lo',
    lat: 13.7312,
    lng: 100.5814,
    province: 'Bangkok',
    aliases: ['Soi Sukhumvit 55', 'ทองหล่อ', 'Khlong Tan Nuea, Watthana, Bangkok'],
  },
  {
    name: 'Soi Cowboy',
    lat: 13.7369,
    lng: 100.5632,
    province: 'Bangkok',
    aliases: ['ซอยคาวบอย', 'Khlong Toei Nuea, Watthana, Bangkok 10110'],
  },
  {
    name: 'Ong Ang Walking Street',
    lat: 13.7451,
    lng: 100.5043,
    province: 'Bangkok',
    aliases: ['ถนนคนเดินคลองโอ่งอ่าง', 'Ong Ang Canal, Samphanthawong, Bangkok 10100'],
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
