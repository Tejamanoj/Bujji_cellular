import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { CustomerInfo } from '@/types';

const COLLECTION = 'customers';

// ─── Customers ───────────────────────────────────────────────────────────────

/** Fetch all customers */
export async function fetchAllCustomers(): Promise<CustomerInfo[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('joinDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDoc(d.id, d.data()));
  } catch (e: any) {
    console.error('❌ fetchAllCustomers:', e.message);
    return [];
  }
}

/** Fetch a single customer by ID */
export async function fetchCustomerById(customerId: string): Promise<CustomerInfo | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, customerId));
    if (!snapshot.exists()) return null;
    return mapDoc(snapshot.id, snapshot.data());
  } catch (e: any) {
    console.error('❌ fetchCustomerById:', e.message);
    return null;
  }
}

/** Update customer status (active | banned) */
export async function updateCustomerStatus(
  customerId: string,
  status: 'active' | 'banned'
) {
  try {
    await updateDoc(doc(db, COLLECTION, customerId), { status, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (e: any) {
    console.error('❌ updateCustomerStatus:', e.message);
    return { success: false, error: e.message };
  }
}

/** Delete a customer */
import { deleteDoc } from 'firebase/firestore';

export async function deleteCustomer(customerId: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, customerId));
    return { success: true };
  } catch (e: any) {
    console.error('❌ deleteCustomer:', e.message);
    return { success: false, error: e.message };
  }
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapDoc(id: string, data: any): CustomerInfo {
  return {
    id,
    name: data.name,
    email: data.email,
    profileImage: data.profileImage,
    loyaltyPoints: data.loyaltyPoints ?? 0,
    status: data.status ?? 'active',
    ordersCount: data.ordersCount ?? 0,
    totalSpent: data.totalSpent ?? 0,
    joinDate: data.joinDate ?? '',
    repairRequestsCount: data.repairRequestsCount ?? 0,
  };
}
