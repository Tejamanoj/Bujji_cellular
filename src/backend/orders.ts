import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, CartItem, Address } from '@/types';

const COLLECTION = 'orders';

// ─── Create Order ─────────────────────────────────────────────────────────────

/**
 * Save a new order to Firestore when a customer completes checkout.
 * Also increments the customer's ordersCount and totalSpent in Firestore.
 */
export async function createOrder(
  customerId: string,
  customerName: string,
  customerEmail: string,
  items: CartItem[],
  totals: { subtotal: number; discount: number; shipping: number; total: number },
  address: Address,
  paymentMethod: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const trackingTimeline = [
      {
        status: 'Order Placed',
        date: new Date().toLocaleString('en-IN'),
        desc: 'Your order has been placed successfully.',
        completed: true,
      },
      { status: 'Processed', date: '', desc: 'Payment verified and items prepared.', completed: false },
      { status: 'Shipped', date: '', desc: 'Awaiting package pickup.', completed: false },
      { status: 'Delivered', date: '', desc: 'Awaiting delivery.', completed: false },
    ];

    const orderData = {
      customerId,
      customerName,
      customerEmail,
      date: new Date().toISOString(),
      status: 'pending',
      items: items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images?.[0] ?? '',
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor ?? '',
        selectedStorage: item.selectedStorage ?? '',
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      shippingAddress: address,
      paymentMethod,
      trackingTimeline,
      invoiceUrl: '',
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, COLLECTION), orderData);

    // Update customer stats
    await updateDoc(doc(db, 'customers', customerId), {
      ordersCount: increment(1),
      totalSpent: increment(totals.total),
    });

    return { success: true, orderId: ref.id };
  } catch (e: any) {
    console.error('❌ createOrder:', e.message);
    return { success: false, error: e.message };
  }
}

// ─── Orders ──────────────────────────────────────────────────────────────────

/** Fetch all orders (admin view) */
export async function fetchAllOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDoc(d.id, d.data()));
  } catch (e: any) {
    console.error('❌ fetchAllOrders:', e.message);
    return [];
  }
}

/** Fetch orders for a specific customer */
export async function fetchOrdersByCustomer(customerId: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('customerId', '==', customerId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDoc(d.id, d.data()));
  } catch (e: any) {
    console.error('❌ fetchOrdersByCustomer:', e.message);
    return [];
  }
}

/** Fetch a single order by ID */
export async function fetchOrderById(orderId: string): Promise<Order | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, orderId));
    if (!snapshot.exists()) return null;
    return mapDoc(snapshot.id, snapshot.data());
  } catch (e: any) {
    console.error('❌ fetchOrderById:', e.message);
    return null;
  }
}

/** Update the status of an order */
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  try {
    await updateDoc(doc(db, COLLECTION, orderId), { status, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (e: any) {
    console.error('❌ updateOrderStatus:', e.message);
    return { success: false, error: e.message };
  }
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapDoc(id: string, data: any): Order {
  const items = (data.items ?? []).map((item: any) => ({
    id: item.id,
    product: {
      id: item.productId ?? '',
      name: item.productName ?? 'iPhone 15 Pro',
      images: item.productImage ? [item.productImage] : [],
      price: item.price ?? 0,
      description: '',
      rating: 5,
      category: '',
      brand: '',
      colors: [],
      storage: [],
      specs: {},
      reviews: [],
      qa: [],
      stock: 0,
    },
    quantity: item.quantity ?? 1,
    selectedColor: item.selectedColor ?? '',
    selectedStorage: item.selectedStorage ?? '',
  }));

  return {
    id,
    date: data.date,
    status: data.status,
    items,
    subtotal: data.subtotal,
    discount: data.discount ?? 0,
    shipping: data.shipping ?? 0,
    total: data.total,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    trackingTimeline: data.trackingTimeline ?? [],
    invoiceUrl: data.invoiceUrl,
  };
}
