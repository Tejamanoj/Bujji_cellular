import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { RepairRequest, RepairMessage, Address } from '@/types';

const COLLECTION = 'repair_requests';
const MESSAGES_COLLECTION = 'repair_messages';

// ─── Repairs ─────────────────────────────────────────────────────────────────

/** Create a new repair request */
export async function createRepairRequest(
  customerId: string,
  deviceName: string,
  issueDesc: string,
  imageUrls: string[],
  pickupAddress: Address,
  preferredDate: string,
  preferredTime: string
): Promise<{ success: boolean; repairId?: string; error?: string }> {
  try {
    const repairData = {
      customerId,
      deviceName,
      issueDesc,
      imageUrls,
      pickupAddress,
      preferredDate,
      preferredTime,
      status: 'submitted',
      cost: 0,
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, COLLECTION), repairData);

    // Add initial system message
    await addRepairMessage(ref.id, `Repair request submitted for ${deviceName}. Issue: ${issueDesc}`, 'user');

    return { success: true, repairId: ref.id };
  } catch (e: any) {
    console.error('❌ createRepairRequest:', e.message);
    return { success: false, error: e.message };
  }
}

/** Fetch all repair requests (admin view) */
export async function fetchAllRepairs(): Promise<RepairRequest[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return await Promise.all(snapshot.docs.map(async (d) => {
      const messages = await fetchRepairMessages(d.id);
      return mapDoc(d.id, d.data(), messages);
    }));
  } catch (e: any) {
    console.error('❌ fetchAllRepairs:', e.message);
    return [];
  }
}

/** Fetch a single repair by ID */
export async function fetchRepairById(repairId: string): Promise<RepairRequest | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, repairId));
    if (!snapshot.exists()) return null;
    const messages = await fetchRepairMessages(repairId);
    return mapDoc(snapshot.id, snapshot.data(), messages);
  } catch (e: any) {
    console.error('❌ fetchRepairById:', e.message);
    return null;
  }
}

/** Update repair status and optional cost */
export async function updateRepairStatus(
  repairId: string,
  status: RepairRequest['status'],
  cost?: number
) {
  try {
    const updateData: any = { status, updatedAt: serverTimestamp() };
    if (cost !== undefined) updateData.cost = cost;
    await updateDoc(doc(db, COLLECTION, repairId), updateData);
    return { success: true };
  } catch (e: any) {
    console.error('❌ updateRepairStatus:', e.message);
    return { success: false, error: e.message };
  }
}

/** Add a message to a repair thread */
export async function addRepairMessage(
  repairId: string,
  text: string,
  sender: 'user' | 'admin'
) {
  try {
    const ref = await addDoc(collection(db, MESSAGES_COLLECTION), {
      repairId,
      sender,
      text,
      timestamp: new Date().toISOString(),
    });
    return { success: true, id: ref.id };
  } catch (e: any) {
    console.error('❌ addRepairMessage:', e.message);
    return { success: false, error: e.message };
  }
}

// ─── Internal ─────────────────────────────────────────────────────────────────
async function fetchRepairMessages(repairId: string): Promise<RepairMessage[]> {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy('timestamp', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .filter((d) => d.data().repairId === repairId)
    .map((d) => ({
      id: d.id,
      sender: d.data().sender,
      text: d.data().text,
      timestamp: d.data().timestamp,
    }));
}

function mapDoc(id: string, data: any, messages: RepairMessage[]): RepairRequest {
  return {
    id,
    deviceName: data.deviceName,
    issueDesc: data.issueDesc,
    imageUrls: data.imageUrls ?? [],
    pickupAddress: data.pickupAddress,
    preferredDate: data.preferredDate,
    preferredTime: data.preferredTime,
    status: data.status,
    cost: data.cost,
    messages,
  };
}
