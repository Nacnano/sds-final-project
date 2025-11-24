#!/usr/bin/env node

/**
 * Comprehensive Seed Script for Microservices
 * Seeds PostgreSQL database: shrine-db
 */

const { Client } = require('pg');

// Database configurations
const databases = {
  shrine: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'shrine_service',
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/01-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%9A%E0%B8%8D%E0%B8%88%E0%B8%A1%E0%B8%9A%E0%B8%9E%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B8%94%E0%B8%B8%E0%B8%AA%E0%B8%B4%E0%B8%95%E0%B8%A7%E0%B8%99%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A7%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg/500px-01-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%9A%E0%B8%8D%E0%B8%88%E0%B8%A1%E0%B8%9A%E0%B8%9E%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B8%94%E0%B8%B8%E0%B8%AA%E0%B8%B4%E0%B8%95%E0%B8%A7%E0%B8%99%E0%B8%B2%E0%B8%A3%E0%B8%A1%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A7%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg'
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
];

async function seedDatabase(dbName, config, seedFunction) {
  const client = new Client(config);

  try {
    await client.connect();
    console.log(`\n📦 Seeding ${dbName}...`);
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

async function seedShrines(client) {
  // Clear existing data
  await client.query('TRUNCATE TABLE shrines CASCADE');

  // Insert shrines
  for (const shrine of shrineData) {
    await client.query(
      `INSERT INTO shrines (id, name, description, location, lat, lng, category, image_url, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        shrine.id,
        shrine.name,
        shrine.description,
        shrine.location,
        shrine.latitude || null,
        shrine.longitude || null,
        shrine.category || null,
        shrine.imageUrl || null,
      ],
    );
  }

  const result = await client.query('SELECT COUNT(*) FROM shrines');
  console.log(`   Inserted ${result.rows[0].count} shrines`);
}

async function main() {
  console.log('🌱 Starting database seeding...\n');
  console.log('='.repeat(60));

  try {
    // Seed shrine database
    await seedDatabase('Shrine Database', databases.shrine, seedShrines);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Shrines: ${shrineData.length}`);
    console.log('\n🚀 You can now test the services!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('\n⚠️  Make sure Docker containers are running:');
    console.error('   docker-compose ps');
    process.exit(1);
  }
}

main();
