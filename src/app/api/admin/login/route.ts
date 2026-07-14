import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/backend';
import { db } from '@/backend/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    // 1. Verify credentials (handles Firestore checks and environment fallback seeding)
    const res = await verifyAdminCredentials(email, password);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 401 });
    }

    // 2. Fetch Admin details from Firestore
    const q = query(collection(db, 'admin_users'), where('email', '==', email));
    const adminSnap = await getDocs(q);
    if (adminSnap.empty) {
      return NextResponse.json({ success: false, error: 'Admin configuration not found in database.' }, { status: 403 });
    }

    const adminDoc = adminSnap.docs[0];
    const adminData = adminDoc.data();

    // 3. Generate JWT Session Token
    const jwtSecret = process.env.JWT_SECRET || 'bujji_cellulars_secure_admin_jwt_secret_key_32_chars';
    const payload = {
      id: adminDoc.id,
      email: email,
      role: adminData.role || 'admin'
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '2h' });

    // 4. Store JWT in Secure HTTP-Only Cookie to satisfy Next.js Middleware
    const cookieStore = await cookies();
    cookieStore.set('bujji_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 // 2 hours
    });

    return NextResponse.json({
      success: true,
      message: 'Admin signed in successfully. Session established.',
      user: {
        id: adminDoc.id,
        name: 'Administrator',
        email: email,
        role: adminData.role || 'admin'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
