-- Initialize shrine database with seed data

-- Create shrines table if not exists
CREATE TABLE IF NOT EXISTS shrines (
    id character(24) NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    name character varying NOT NULL,
    description character varying NOT NULL,
    location character varying NOT NULL,
    lat double precision,
    lng double precision,
    category character varying,
    image_url character varying
);

-- Insert seed data
INSERT INTO shrines (id, name, description, location, lat, lng, category, image_url) VALUES
('6731a1b2c4d5e6f7a8b9c0d1', 'Erawan Shrine', 'Famous Hindu shrine dedicated to Phra Phrom, the Thai representation of Brahma. Known for granting wishes related to business and career success.', '494 Ratchadamri Rd, Pathum Wan, Bangkok 10330', 13.7447, 100.5396, 'career', 'https://www.bangkoktourismguide.com/images/erawan-shrine.jpg'),
('6731a1b2c4d5e6f7a8b9c0d2', 'Trimurti Shrine', 'Popular shrine among young people seeking love. Best visited on Thursday evenings for love-related wishes.', '991/1 Rama I Rd, Pathum Wan, Bangkok 10330', 13.7469, 100.5389, 'love', 'https://d2d3n9ufwugv3m.cloudfront.net/w1200-h900-cfill/topics/uB2JI-IMG_9252.JPG'),
('6731a1b2c4d5e6f7a8b9c0d3', 'Ganesha Shrine', 'Shrine dedicated to Lord Ganesha, known for blessing devotees with success in education and removing obstacles.', '88/3 Soi Sukhumvit 19, Watthana, Bangkok 10110', 13.7412, 100.5589, 'education', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/30/08/09/caption.jpg?w=1200&h=-1&s=1'),
('6731a1b2c4d5e6f7a8b9c0d4', 'Lak Muang Shrine', 'City Pillar Shrine of Bangkok, believed to house the city''s guardian spirit. Popular for career and prosperity-related wishes.', 'Lak Muang Road, Phra Nakhon, Bangkok 10200', 13.7501, 100.493, 'career', 'https://wantseebangkok.com/wp-content/uploads/2024/02/Lak-Mueang-Bangkok-City-Pillar-Shrine-BKK.jpg'),
('6731a1b2c4d5e6f7a8b9c0d5', 'Wat Phra Kaew', 'Temple of the Emerald Buddha, the most sacred Buddhist temple in Thailand. Known for spiritual enlightenment and blessings.', 'Na Phra Lan Road, Phra Nakhon, Bangkok 10200', 13.7515, 100.4925, 'spiritual', 'https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/62/2024/08/29074619/Wat-Phra-Kaew.jpg'),
('6731a1b2c4d5e6f7a8b9c0d6', 'Wat Arun', 'Temple of Dawn, one of Bangkok''s most iconic landmarks. Known for granting wishes related to new beginnings and spiritual awakening.', '158 Thanon Wang Doem, Wat Arun, Bangkok 10600', 13.7437, 100.4887, 'spiritual', NULL),
('6731a1b2c4d5e6f7a8b9c0d7', 'Golden Mount (Wat Saket)', 'Historic temple on a man-made hill with panoramic views of Bangkok. Popular for meditation and peace of mind.', '344 Chakkraphatdi Phong Rd, Ban Bat, Bangkok 10200', 13.7529, 100.5065, 'health', NULL),
('6731a1b2c4d5e6f7a8b9c0d8', 'Wat Pho', 'Temple of the Reclining Buddha, known for traditional Thai massage. Popular for health and healing wishes.', '2 Sanam Chai Rd, Phra Borom Maha Ratchawang, Bangkok 10200', 13.7467, 100.4933, 'health', 'https://www.orientalarchitecture.com/thailand/bangkok/wat-pho/wat-pho09.jpg'),
('6731a1b2c4d5e6f7a8b9c0d9', 'Phra Trimurti Statue', 'Modern statue representing the three main Hindu gods. Famous for love-related wishes, especially on Thursday nights.', 'CentralWorld, Ratchadamri Rd, Bangkok 10330', 13.7469, 100.5398, 'love', NULL),
('6731a1b2c4d5e6f7a8b9c0da', 'Luang Pho To Temple', 'Temple housing a large Buddha image. Known for wishes related to wealth and financial success.', 'Thonburi, Bangkok 10600', 13.7217, 100.4742, 'career', NULL)
ON CONFLICT (id) DO NOTHING;
