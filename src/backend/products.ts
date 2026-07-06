import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '@/types';

const COLLECTION = 'products';

// ─── Products ────────────────────────────────────────────────────────────────

/** Fetch all products */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDoc(d.id, d.data()));
  } catch (e: any) {
    console.error('❌ fetchAllProducts:', e.message);
    return [];
  }
}

/** Fetch a single product by ID */
export async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, productId));
    if (!snapshot.exists()) return null;
    return mapDoc(snapshot.id, snapshot.data());
  } catch (e: any) {
    console.error('❌ fetchProductById:', e.message);
    return null;
  }
}

/** Create a new product */
export async function createProduct(
  product: Omit<Product, 'id' | 'rating' | 'reviews' | 'qa'>
) {
  try {
    const ref = await addDoc(collection(db, COLLECTION), {
      ...product,
      rating: 0,
      reviews: [],
      qa: [],
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (e: any) {
    console.error('❌ createProduct:', e.message);
    return { success: false, error: e.message };
  }
}

/** Update an existing product */
export async function updateProduct(product: Product) {
  try {
    const { id, ...data } = product;
    await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (e: any) {
    console.error('❌ updateProduct:', e.message);
    return { success: false, error: e.message };
  }
}

/** Delete a product */
export async function deleteProduct(productId: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, productId));
    return { success: true };
  } catch (e: any) {
    console.error('❌ deleteProduct:', e.message);
    return { success: false, error: e.message };
  }
}

/** Bulk delete products */
export async function bulkDeleteProducts(productIds: string[]) {
  try {
    await Promise.all(productIds.map((id) => deleteDoc(doc(db, COLLECTION, id))));
    return { success: true };
  } catch (e: any) {
    console.error('❌ bulkDeleteProducts:', e.message);
    return { success: false, error: e.message };
  }
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapDoc(id: string, data: any): Product {
  return {
    id,
    name: data.name,
    price: data.price,
    originalPrice: data.originalPrice,
    description: data.description,
    rating: data.rating ?? 0,
    images: data.images ?? [],
    category: data.category,
    brand: data.brand,
    colors: data.colors ?? [],
    storage: data.storage ?? [],
    specs: data.specs ?? {},
    reviews: data.reviews ?? [],
    qa: data.qa ?? [],
    stock: data.stock,
    featured: data.featured ?? false,
    flashSale: data.flashSale ?? false,
  };
}
