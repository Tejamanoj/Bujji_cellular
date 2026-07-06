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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  enabled: boolean;
  order: number;
  featured: boolean;
}

const COLLECTION = 'categories';

/** Fetch all categories sorted by order */
export async function fetchAllCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        slug: data.slug,
        description: data.description ?? '',
        image: data.image ?? '',
        enabled: data.enabled ?? true,
        order: data.order ?? 0,
        featured: data.featured ?? false,
      };
    });
  } catch (e: any) {
    console.error('❌ fetchAllCategories:', e.message);
    return [];
  }
}

/** Create a new category */
export async function createCategory(category: Omit<Category, 'id'>) {
  try {
    const ref = await addDoc(collection(db, COLLECTION), {
      ...category,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (e: any) {
    console.error('❌ createCategory:', e.message);
    return { success: false, error: e.message };
  }
}

/** Update an existing category */
export async function updateCategory(id: string, category: Partial<Category>) {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      ...category,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (e: any) {
    console.error('❌ updateCategory:', e.message);
    return { success: false, error: e.message };
  }
}

/** Delete a category */
export async function deleteCategory(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return { success: true };
  } catch (e: any) {
    console.error('❌ deleteCategory:', e.message);
    return { success: false, error: e.message };
  }
}
