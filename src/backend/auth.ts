import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User as AppUser } from '@/types';
import bcrypt from 'bcryptjs';

// ─── Admin Authentication Helpers ─────────────────────────────────────────────

export async function verifyAdminCredentials(email: string, pass: string) {
  // Query by email
  const q = query(collection(db, 'admin_users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) {
    return { success: false, error: 'User is not an authorized admin.' };
  }
  
  const adminDoc = snap.docs[0];
  const data = adminDoc.data();
  
  // If bcrypt hash exists, use it
  if (data.passwordHash) {
    const match = await bcrypt.compare(pass, data.passwordHash);
    if (!match) {
      return { success: false, error: 'Incorrect password.' };
    }
    return { success: true, uid: adminDoc.id, role: data.role || 'admin' };
  }
  
  // Otherwise, verify via Firebase Auth and migrate to bcrypt
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const hash = await bcrypt.hash(pass, 10);
    await updateDoc(doc(db, 'admin_users', adminDoc.id), {
      passwordHash: hash
    });
    return { success: true, uid: cred.user.uid, role: data.role || 'admin' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Admin Authentication ─────────────────────────────────────────────────────

/**
 * Sign in as admin using Firebase Auth (email + password).
 */
export async function adminSignIn(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    const adminDoc = await getDoc(doc(db, 'admin_users', user.uid));
    if (!adminDoc.exists()) {
      await firebaseSignOut(auth);
      return { success: false, error: 'User is not an authorized admin.' };
    }

    return { success: true, user, role: adminDoc.data().role };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign out admin or user.
 */
export async function adminSignOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get the currently logged-in Firebase user.
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

// ─── Customer Authentication (Email + Password) ───────────────────────────────

/**
 * Register a new customer with name, email and password.
 * Creates a Firebase Auth user and provisions their Firestore profile.
 */
export async function customerSignUp(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  try {
    // Create Firebase Auth account
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    // Set the display name in Firebase Auth
    await updateProfile(firebaseUser, { displayName: name });

    // Create customer profile document in Firestore
    const customerData = {
      name,
      email,
      profileImage: '/images/avatar-placeholder.svg',
      loyaltyPoints: 100, // 100 points welcome bonus
      status: 'active',
      ordersCount: 0,
      totalSpent: 0,
      joinDate: new Date().toISOString(),
      repairRequestsCount: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'customers', firebaseUser.uid), customerData);

    return {
      success: true,
      user: {
        id: firebaseUser.uid,
        name,
        email,
        profileImage: '/images/avatar-placeholder.svg',
        loyaltyPoints: 100,
      },
    };
  } catch (error: any) {
    let message = error.message;
    if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email already exists. Please log in instead.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password must be at least 6 characters long.';
    }
    return { success: false, error: message };
  }
}

/**
 * Sign in an existing customer with email and password.
 * Fetches their Firestore profile after auth.
 */
export async function customerSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    // Fetch Firestore customer profile
    const snap = await getDoc(doc(db, 'customers', firebaseUser.uid));

    let appUser: AppUser;
    if (snap.exists()) {
      const data = snap.data();
      appUser = {
        id: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || 'Member',
        email: data.email,
        profileImage: data.profileImage || '/images/avatar-placeholder.svg',
        loyaltyPoints: data.loyaltyPoints ?? 0,
      };
    } else {
      // Profile missing — create it on the fly
      appUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Member',
        email: firebaseUser.email!,
        profileImage: '/images/avatar-placeholder.svg',
        loyaltyPoints: 0,
      };
      await setDoc(doc(db, 'customers', firebaseUser.uid), {
        ...appUser,
        status: 'active',
        ordersCount: 0,
        totalSpent: 0,
        joinDate: new Date().toISOString(),
        repairRequestsCount: 0,
        createdAt: serverTimestamp(),
      });
    }

    return { success: true, user: appUser };
  } catch (error: any) {
    let message = error.message;
    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      message = 'Incorrect email or password. Please try again.';
    }
    return { success: false, error: message };
  }
}
