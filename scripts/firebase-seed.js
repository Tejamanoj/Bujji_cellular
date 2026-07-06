/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, writeBatch } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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
const auth = getAuth(app);

const mockAdminProducts = [
  {
    name: 'Bujji Gold-Phantom Smartphone',
    price: 1299,
    originalPrice: 1499,
    description: 'A futuristic smartphone with a full liquid metal gold body, transparent backing, integrated holographic UI, and an elite 200MP camera system.',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'smartphones',
    brand: 'Bujji',
    colors: ['#D4AF37', '#0A0A0A', '#E5E5E5'],
    storage: ['256GB', '512GB', '1TB'],
    specs: {
      Processor: 'Bujji Quantum Octa-Core',
      Camera: '200MP Triple Lens with Gold Laser Focus',
      Display: '6.8 inch 144Hz Holographic OLED',
      Battery: '5500mAh Solid State with 120W Charging',
    },
    reviews: [],
    qa: [],
    stock: 12,
    featured: true,
    flashSale: true,
  },
  {
    name: 'AeroBuds Gold Premium Edition',
    price: 249,
    originalPrice: 299,
    description: 'Ultra-lightweight active noise-cancelling wireless earbuds featuring gold-plated acoustic sound tubes and deep high-fidelity acoustics.',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'audio',
    brand: 'Bujji',
    colors: ['#D4AF37', '#111111'],
    storage: ['Standard'],
    specs: {},
    reviews: [],
    qa: [],
    stock: 45,
    featured: true,
    flashSale: false,
  },
  {
    name: 'Nothing Phone (3) Dark Cyber',
    price: 899,
    description: 'Premium smartphone with a unique translucent backing, programmable LED glyph interface, and eco-friendly recycled gold internal contacts.',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'smartphones',
    brand: 'Nothing',
    colors: ['#111111', '#FFFFFF'],
    storage: ['128GB', '256GB'],
    specs: {},
    reviews: [],
    qa: [],
    stock: 5,
    featured: false,
    flashSale: false,
  },
  {
    name: 'Bujji Chrono Gold Smartwatch',
    price: 449,
    originalPrice: 499,
    description: 'Handcrafted luxury smartwatch with real gold bezels, high-precision vitals tracking, and offline holographic map features.',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'wearables',
    brand: 'Bujji',
    colors: ['#D4AF37', '#0A0A0A'],
    storage: ['Standard'],
    specs: {},
    reviews: [],
    qa: [],
    stock: 22,
    featured: true,
    flashSale: false,
  },
  {
    name: 'Glacier MagSafe Gold Case',
    price: 79,
    description: 'Ultra-thin, drop-tested bumper protective case featuring solid brass buttons and premium gold glitter infused backing.',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'accessories',
    brand: 'Bujji',
    colors: ['#D4AF37', '#000000'],
    storage: ['Standard'],
    specs: {},
    reviews: [],
    qa: [],
    stock: 0,
    featured: false,
    flashSale: false,
  }
];

async function seed() {
  console.log('🚀 Initiating Firebase Seeding...');
  
  // Seed admin@bujjicellular.com
  let uid = '';
  try {
    const cred = await createUserWithEmailAndPassword(auth, 'admin@bujjicellular.com', 'Admin@123');
    uid = cred.user.uid;
    console.log('✅ Admin user admin@bujjicellular.com created with UID:', uid);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('ℹ️ admin@bujjicellular.com already exists.');
    } else {
      console.error('❌ Error creating admin:', err.message);
    }
  }

  if (uid) {
    await setDoc(doc(db, 'admin_users', uid), {
      email: 'admin@bujjicellular.com',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
    });
    console.log('✅ Admin mapping updated in Firestore.');
  }

  // Seed Products
  const batch = writeBatch(db);
  mockAdminProducts.forEach((prod, i) => {
    const ref = doc(collection(db, 'products'), `prod_${i + 1}`);
    batch.set(ref, {
      ...prod,
      createdAt: new Date().toISOString()
    });
  });
  await batch.commit();
  console.log('✅ Products seeded in Firestore.');
  console.log('🎯 Seeding complete!');
  process.exit(0);
}

seed();
