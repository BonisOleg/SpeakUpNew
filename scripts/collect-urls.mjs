import { writeFileSync } from 'node:fs';

const baseUrl = process.env.BASE_URL || 'http://localhost:8000';

// Програми (17)
const programs = [
  'individual', 'group', 'online-english-course', 'corporate',
  'intensive', 'native-teachers', 'business', 'ielts', 'toefl',
  'kids', 'speaking-course', 'tourism', 'anglijska-dlya-medykiv',
  'anglijska-dlya-jurystiv', 'anglijska-dlya-it',
  'english-for-beginners', 'short-courses'
];

// Локації (13)
const locations = [
  'sumskaya', 'minskaya', 'poznyaki', 'levoberezhnaya',
  'universitet', 'vokzalnaya', 'jitomirskaya', 'goloseevskaya',
  'chervonoi-kalini', 'monomakha', 'metallurgov', 'chernovola',
  'ekaterininskaya'
];

// Міста (4)
const cities = ['harkov', 'dnepr', 'odessa', 'lvov'];

// Генерація URLs
const urls = [
  // Головні (4 x 2 = 8)
  `${baseUrl}/`, `${baseUrl}/ru/`,
  `${baseUrl}/about`, `${baseUrl}/ru/about`,
  `${baseUrl}/contacts`, `${baseUrl}/ru/contacts`,
  `${baseUrl}/testing`, `${baseUrl}/ru/testing`,

  // Програми (17 x 2 = 34)
  ...programs.flatMap(p => [
    `${baseUrl}/programs/${p}`,
    `${baseUrl}/ru/programs/${p}`
  ]),

  // Локації (13 x 2 = 26)
  ...locations.flatMap(l => [
    `${baseUrl}/school/${l}`,
    `${baseUrl}/ru/school/${l}`
  ]),

  // Міста (4 x 2 = 8)
  ...cities.flatMap(c => [
    `${baseUrl}/${c}`,
    `${baseUrl}/ru/${c}`
  ]),
];

writeFileSync('url-list.txt', urls.join('\n'), 'utf8');
console.log(`✅ Зібрано ${urls.length} URL (54 сторінки x 2 мови = 108)`);








