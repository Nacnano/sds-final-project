#!/usr/bin/env node

/**
 * Comprehensive Seed Script for All Microservices in Kubernetes
 * Seeds PostgreSQL databases: shrine-db, user-db, wishing-db, rating-db
 */

const { Client } = require('pg');

// Database configurations for Kubernetes
// Use service names from k8s deployments
const databases = {
  shrine: {
    host: process.env.SHRINE_DB_HOST || 'shrine-db',
    port: parseInt(process.env.SHRINE_DB_PORT || '5432'),
    user: process.env.SHRINE_DB_USER || 'postgres',
    password: process.env.SHRINE_DB_PASSWORD || 'postgres',
    database: process.env.SHRINE_DB_NAME || 'shrine_service',
  },
};

// Seed data
const shrineData = [
  {
    id: '6731a1b2c4d5e6f7a8b9c0d1',
    name: 'Erawan Shrine',
    description:
      'Famous Hindu shrine dedicated to Phra Phrom, the Thai representation of Brahma. Known for granting wishes related to business and career success.',
    location: '494 Ratchadamri Rd, Pathum Wan, Bangkok 10330',
    category: 'career',
    province: 'Bangkok',
    latitude: 13.7447,
    longitude: 100.5396,
    imageUrl: 'https://www.bangkoktourismguide.com/images/erawan-shrine.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0d2',
    name: 'Trimurti Shrine',
    description:
      'Popular shrine among young people seeking love. Best visited on Thursday evenings for love-related wishes.',
    location: '991/1 Rama I Rd, Pathum Wan, Bangkok 10330',
    category: 'love',
    province: 'Bangkok',
    latitude: 13.7469,
    longitude: 100.5389,
    imageUrl: 'https://d2d3n9ufwugv3m.cloudfront.net/w1200-h900-cfill/topics/uB2JI-IMG_9252.JPG',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0d3',
    name: 'Ganesha Shrine',
    description:
      'Shrine dedicated to Lord Ganesha, known for blessing devotees with success in education and removing obstacles.',
    location: '88/3 Soi Sukhumvit 19, Watthana, Bangkok 10110',
    category: 'education',
    province: 'Bangkok',
    latitude: 13.7412,
    longitude: 100.5589,
    imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/30/08/09/caption.jpg?w=1200&h=-1&s=1',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0d4',
    name: 'Lak Muang Shrine',
    description:
      "City Pillar Shrine of Bangkok, believed to house the city's guardian spirit. Popular for career and prosperity-related wishes.",
    location: 'Lak Muang Road, Phra Nakhon, Bangkok 10200',
    category: 'career',
    province: 'Bangkok',
    latitude: 13.7501,
    longitude: 100.493,
    imageUrl: 'https://wantseebangkok.com/wp-content/uploads/2024/02/Lak-Mueang-Bangkok-City-Pillar-Shrine-BKK.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0d5',
    name: 'Wat Phra Kaew',
    description:
      'Temple of the Emerald Buddha, the most sacred Buddhist temple in Thailand. Known for spiritual enlightenment and blessings.',
    location: 'Na Phra Lan Road, Phra Nakhon, Bangkok 10200',
    category: 'spiritual',
    province: 'Bangkok',
    latitude: 13.7515,
    longitude: 100.4925,
    imageUrl: 'https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/62/2024/08/29074619/Wat-Phra-Kaew.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0d6',
    name: 'Wat Arun',
    description:
      "Temple of Dawn, one of Bangkok's most iconic landmarks. Known for granting wishes related to new beginnings and spiritual awakening.",
    location: '158 Thanon Wang Doem, Wat Arun, Bangkok 10600',
    category: 'spiritual',
    province: 'Bangkok',
    latitude: 13.7437,
    longitude: 100.4887,
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0d7',
    name: 'Golden Mount (Wat Saket)',
    description:
      'Historic temple on a man-made hill with panoramic views of Bangkok. Popular for meditation and peace of mind.',
    location: '344 Chakkraphatdi Phong Rd, Ban Bat, Bangkok 10200',
    category: 'health',
    province: 'Bangkok',
    latitude: 13.7545,
    longitude: 100.5065,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmPPy2IIWqEMPi8gdfRjdBQxCxjxcqBm_Uuw&s'
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0d8',
    name: 'Wat Benchamabophit',
    description:
      'The Marble Temple, known for its Italian marble construction. Associated with wisdom and learning.',
    location: '69 Thanon Si Ayutthaya, Dusit, Bangkok 10300',
    category: 'education',
    province: 'Bangkok',
    latitude: 13.7699,
    longitude: 100.5153,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/01-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%9A%E0%B8%8D%E0%B8%88%E0%B8%A1%E0%B8%9A%E0%B8%9E%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B8%94%E0%B8%B8%E0%B8%AA%E0%B8%B4%E0%B8%95%E0%B8%A7%E0%B8%99%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A7%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg/500px-01-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%9A%E0%B8%8D%E0%B8%88%E0%B8%A1%E0%B8%9A%E0%B8%9E%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B8%94%E0%B8%B8%E0%B8%AA%E0%B8%B4%E0%B8%95%E0%B8%A7%E0%B8%99%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A7%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg'
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0d9',
    name: 'Phra Phrom Shrine at CentralWorld',
    description:
      'Modern shrine dedicated to Brahma, popular among shoppers and tourists seeking blessings for prosperity.',
    location: 'CentralWorld, Ratchadamri Rd, Bangkok 10330',
    category: 'wealth',
    province: 'Bangkok',
    latitude: 13.7469,
    longitude: 100.5399,
    imageUrl: 'https://c8.alamy.com/zooms/9/1367d9981aa74414b53969c15a70b848/ptjcaa.jpg'
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0da',
    name: 'Chao Mae Tuptim Shrine',
    description:
      'Unique shrine known for fertility blessings, decorated with colorful phallic symbols and offerings.',
    location: 'Nai Lert Park, Wireless Rd, Bangkok 10330',
    category: 'love',
    province: 'Bangkok',
    latitude: 13.7423,
    longitude: 100.5489,
    imageUrl: 'https://atmindgroup.com/hotelambersukhumvit85/wp-content/uploads/2024/04/IMG_3393-1920x893.jpg'
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0db',
    name: 'Lakshmi Shrine',
    description:
      'Located on the Gaysorn Village rooftop, this shrine is dedicated to the Goddess of Wealth and Fortune. It is also highly popular for those seeking love and beauty.',
    location: '999 Ploenchit Rd, Pathum Wan, Bangkok 10330',
    category: 'wealth',
    province: 'Bangkok',
    latitude: 13.7445,
    longitude: 100.5404,
    imageUrl: 'https://img.wongnai.com/p/1920x0/2020/12/15/b07211c26b5d4d14991587a7905c4213.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0dc',
    name: 'Sri Maha Mariamman Temple (Wat Khaek)',
    description:
      'A vibrant Hindu temple in Silom dedicated to Goddess Uma Devi. It is extremely famous for blessings regarding love, fertility, and protection from bad luck.',
    location: '2 Pan Rd, Silom, Bang Rak, Bangkok 10500',
    category: 'love',
    province: 'Bangkok',
    latitude: 13.7242,
    longitude: 100.5229,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Sri_Maha_Mariamman_Temple_Bangkok_01.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0dd',
    name: 'Wat Hua Lamphong',
    description:
      'Famous for the Ruamkatanyu Foundation where visitors donate coffins for the deceased without relatives. It is believed to improve karma, extend life, and bring good health.',
    location: '728 Rama IV Rd, Si Phraya, Bang Rak, Bangkok 10500',
    category: 'health',
    province: 'Bangkok',
    latitude: 13.7323,
    longitude: 100.5292,
    imageUrl: 'https://www.tourismthailand.org/Images/attraction/content/2441/1.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0de',
    name: 'Tiger God Shrine (San Chao Pho Suea)',
    description:
      'A very potent Chinese shrine in the Old City. Locals flock here to ask for power, promotion in their career, and the removal of obstacles or bad spirits.',
    location: '468 Tanao Road, San Chao Pho Sua, Phra Nakhon, Bangkok 10200',
    category: 'career',
    province: 'Bangkok',
    latitude: 13.7525,
    longitude: 100.4993,
    imageUrl: 'https://lh3.googleusercontent.com/p/AF1QipP-5JkY3Qe_XqW_Lg5o5o5Q9Q9Q9Q9Q9Q9Q9Q9Q=s1600-w1200',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0df',
    name: 'Wat Mangkon Kamalawat (Leng Noei Yi)',
    description:
      'The largest Chinese Buddhist temple in Bangkok. Famous for resolving "Year of the Zodiac" conflicts (Tai Sui) and praying for general prosperity and health.',
    location: '423 Charoen Krung Rd, Pom Prap, Bangkok 10100',
    category: 'spiritual',
    province: 'Bangkok',
    latitude: 13.7433,
    longitude: 100.5093,
    imageUrl: 'https://media.timeout.com/images/105244294/image.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0e0',
    name: 'Mae Nak Phra Khanong Shrine',
    description:
      'Dedicated to the legendary ghost Mae Nak. People visit to pray for enduring love, easy childbirth, and to draw lucky lottery numbers.',
    location: 'Wat Mahabut, On Nut 7/1 Alley, Suan Luang, Bangkok 10250',
    category: 'love',
    province: 'Bangkok',
    latitude: 13.7108,
    longitude: 100.6013,
    imageUrl: 'https://thesmartlocal.co.th/wp-content/uploads/2020/10/Mae-Nak-Shrine-Cover-Image.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0e1',
    name: 'Wat Traimit (Golden Buddha)',
    description:
      'Home to the world’s largest solid gold Buddha image. It is a major landmark in Chinatown visited by those seeking wealth, luck, and prosperity.',
    location: '661 Charoen Krung Rd, Talat Noi, Samphanthawong, Bangkok 10100',
    category: 'wealth',
    province: 'Bangkok',
    latitude: 13.7381,
    longitude: 100.5137,
    imageUrl: 'https://cdn.getyourguide.com/img/location/5ffeb52c62d1e.jpeg/88.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0e2',
    name: 'Kuan Yin Shrine (Thian Fa Foundation)',
    description:
      'Located in the heart of Chinatown, this shrine houses a statue of the Goddess of Mercy made of sandalwood. It is a top destination for praying for good health.',
    location: 'Yaowarat Road, Samphanthawong, Bangkok 10100',
    category: 'health',
    province: 'Bangkok',
    latitude: 13.7384,
    longitude: 100.5110,
    imageUrl: 'https://lh3.googleusercontent.com/p/AF1QipN1l1l1l1l1l1l1l1l1l1l1l1l1l1l1l1l1=s1600-w1200',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0e3',
    name: 'Indra Shrine',
    description:
      'Located in front of Amarin Plaza, this shrine is dedicated to the King of Gods. Devotees pray here for protection, authority, and career advancement.',
    location: '496 Ploenchit Rd, Pathum Wan, Bangkok 10330',
    category: 'career',
    province: 'Bangkok',
    latitude: 13.7441,
    longitude: 100.5413,
    imageUrl: 'https://readthecloud.co/wp-content/uploads/2019/12/god-shopping-2.jpg',
  },
  {
    id: '6731a1b2c4d5e6f7a8b9c0e4',
    name: 'Narayan Shrine',
    description:
      'Located in front of the InterContinental Hotel, dedicated to Lord Vishnu. Known for protecting businesses and granting success in trade and commerce.',
    location: '973 Ploenchit Rd, Pathum Wan, Bangkok 10330',
    category: 'wealth',
    province: 'Bangkok',
    latitude: 13.7446,
    longitude: 100.5417,
    imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/df/64/35/narayana-shrine.jpg?w=1200&h=-1&s=1',
  },
];

async function seedShrines(client) {
  // Check if data exists
  const res = await client.query('SELECT COUNT(*) FROM shrines');
  const count = parseInt(res.rows[0].count);

  if (count > 0) {
    console.log(`   ⚠️  Shrines table already has ${count} records. Skipping seed.`);
    return;
  }

  console.log('   Inserting shrines...');

  // Note: Database uses "createdAt" and "updatedAt" (camelCase with quotes)
  // ID is required as it's not auto-generated in DB.
  const query = `
    INSERT INTO shrines (
      id, "createdAt", "updatedAt", name, description, location, lat, lng, category, image_url
    )
    VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO NOTHING
  `;

  for (const shrine of shrineData) {
    await client.query(query, [
      shrine.id,
      shrine.name,
      shrine.description,
      shrine.location,
      shrine.latitude,
      shrine.longitude,
      shrine.category,
      shrine.imageUrl,
   ]);
  }

  console.log(`   ✅ Inserted ${shrineData.length} shrines`);
}

async function seedDatabase(dbName, config, seedFunction) {
  const client = new Client(config);

  try {
    console.log(`\n📦 Connecting to ${dbName} at ${config.host}:${config.port}...`);
    await client.connect();
    console.log(`📦 Seeding ${dbName}...`);
    await seedFunction(client);
    console.log(`✅ ${dbName} seeded successfully`);
    await client.end();
  } catch (error) {
    console.error(`❌ Error seeding ${dbName}:`, error.message);
    try {
      await client.end();
    } catch (e) {
      // Ignore connection closing errors
    }
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting Kubernetes database seeding...\n');
  console.log('='.repeat(60));

  try {
    // Seed all databases
    await seedDatabase('Shrine Database', databases.shrine, seedShrines);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All databases seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Shrines: ${shrineData.length}`);
    console.log('\n🚀 You can now test the services!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('\n⚠️  Make sure Kubernetes services are running:');
    console.error('   kubectl get pods');
    console.error('   kubectl get services');
    process.exit(1);
  }
}

main();
