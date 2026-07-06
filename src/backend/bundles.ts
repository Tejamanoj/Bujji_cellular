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

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  productIds: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  image?: string;
}

const COLLECTION = 'bundles';

/** Fetch all bundles */
export async function fetchAllBundles(): Promise<Bundle[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        description: data.description ?? '',
        productIds: data.productIds ?? [],
        originalPrice: data.originalPrice ?? 0,
        bundlePrice: data.bundlePrice ?? 0,
        savings: data.savings ?? 0,
        image: data.image ?? '',
      };
    });
  } catch (e: any) {
    console.error('❌ fetchAllBundles:', e.message);
    return [];
  }
}

/** Create a new bundle pack */
export async function createBundle(bundle: Omit<Bundle, 'id'>) {
  try {
    const ref = await addDoc(collection(db, COLLECTION), {
      ...bundle,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (e: any) {
    console.error('❌ createBundle:', e.message);
    return { success: false, error: e.message };
  }
}

/** Delete a bundle pack */
export async function deleteBundle(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return { success: true };
  } catch (e: any) {
    console.error('❌ deleteBundle:', e.message);
    return { success: false, error: e.message };
  }
}
