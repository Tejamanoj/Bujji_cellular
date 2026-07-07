// ─── Firebase Client ─────────────────────────────────────────────────────────
export { db, auth, storage } from './firebase';

// ─── Auth ────────────────────────────────────────────────────────────────────
export { adminSignIn, adminSignOut, getCurrentUser, customerSignIn, customerSignUp, verifyAdminCredentials } from './auth';

// ─── Products ────────────────────────────────────────────────────────────────
export {
  fetchAllProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from './products';

// ─── Customers ───────────────────────────────────────────────────────────────
export {
  fetchAllCustomers,
  fetchCustomerById,
  updateCustomerStatus,
  deleteCustomer,
} from './customers';

// ─── Orders ──────────────────────────────────────────────────────────────────
export {
  createOrder,
  fetchAllOrders,
  fetchOrdersByCustomer,
  fetchOrderById,
  updateOrderStatus,
} from './orders';

// ─── Repairs ─────────────────────────────────────────────────────────────────
export {
  createRepairRequest,
  fetchAllRepairs,
  fetchRepairById,
  updateRepairStatus,
  addRepairMessage,
} from './repairs';

// ─── Analytics ───────────────────────────────────────────────────────────────
export { fetchDashboardStats, fetchAnalyticsData } from './analytics';

// ─── Settings ────────────────────────────────────────────────────────────────
export { fetchStoreSettings, saveStoreSettings } from './settings';
export type { StoreSettings } from './settings';

// ─── Categories ──────────────────────────────────────────────────────────────
export { fetchAllCategories, createCategory, updateCategory, deleteCategory } from './categories';
export type { Category } from './categories';

// ─── Bundles ─────────────────────────────────────────────────────────────────
export { fetchAllBundles, createBundle, deleteBundle } from './bundles';
export type { Bundle } from './bundles';


