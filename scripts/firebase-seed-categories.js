/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, writeBatch } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDjnpSHtCo2j-4qBcfnddCl7_kJMY7j9Cw",
  authDomain: "bujjicellulars-1389e.firebaseapp.com",
  projectId: "bujjicellulars-1389e",
  storageBucket: "bujjicellulars-1389e.firebasestorage.app",
  messagingSenderId: "507176209291",
  appId: "1:507176209291:web:7ea13406a209153cee7d8e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mockCategories = [
  { name: 'Smartphones', slug: 'smartphones', description: 'Premium flagship smartphones', enabled: true, order: 1, featured: true, image: '📱' },
  { name: 'Audio', slug: 'audio', description: 'Elite audiophile audio gear', enabled: true, order: 2, featured: true, image: '🎧' },
  { name: 'Wearables', slug: 'wearables', description: 'Handcrafted luxury smartwatches', enabled: true, order: 3, featured: true, image: '⌚' },
  { name: 'Power & Chargers', slug: 'power-chargers', description: 'Fast MagSafe charging devices', enabled: true, order: 4, featured: true, image: '⚡' },
  { name: 'Cases & Covers', slug: 'cases-covers', description: 'Military grade protective cases', enabled: true, order: 5, featured: true, image: '🛡️' }
];

async function seedCategories() {
  console.log('🚀 Seeding Categories into Firestore...');
  const batch = writeBatch(db);
  mockCategories.forEach((cat) => {
    const ref = doc(collection(db, 'categories'), cat.slug);
    batch.set(ref, {
      ...cat,
      createdAt: new Date().toISOString()
    });
  });
  await batch.commit();
  console.log('✅ Categories successfully seeded!');
  process.exit(0);
}

seedCategories();
