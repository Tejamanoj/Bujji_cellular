import { NextResponse } from 'next/server';
import { db } from '@/backend/firebase';
import { doc, getDoc, deleteDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Email and OTP code are required.' }, { status: 400 });
    }

    const otpDocRef = doc(db, 'admin_otps', email);
    const otpDocSnap = await getDoc(otpDocRef);

    if (!otpDocSnap.exists()) {
      return NextResponse.json({ success: false, error: 'No active OTP verification session found.' }, { status: 400 });
    }

    const data = otpDocSnap.data();
    const now = new Date().toISOString();

    // 1. Check expiration
    if (now > data.expiresAt) {
      await deleteDoc(otpDocRef);
      return NextResponse.json({ success: false, error: 'OTP code has expired. Please request a new one.' }, { status: 410 });
    }

    // 2. Check brute force attempts limit (Max 5 attempts)
    if (data.attempts >= 5) {
      await deleteDoc(otpDocRef);
      return NextResponse.json({ success: false, error: 'Too many failed verification attempts. This OTP has been deactivated.' }, { status: 429 });
    }

    // 3. Compare OTP
    const isMatch = await bcrypt.compare(otp, data.otp);
    if (!isMatch) {
      // Increment attempt counter
      await updateDoc(otpDocRef, {
        attempts: data.attempts + 1
      });
      const remaining = 5 - (data.attempts + 1);
      return NextResponse.json({
        success: false,
        error: `Invalid verification code. ${remaining} attempts remaining.`
      }, { status: 401 });
    }

    // 4. Fetch Admin User details
    const q = query(collection(db, 'admin_users'), where('email', '==', email));
    const adminSnap = await getDocs(q);
    if (adminSnap.empty) {
      return NextResponse.json({ success: false, error: 'Admin configuration not found.' }, { status: 403 });
    }

    const adminDoc = adminSnap.docs[0];
    const adminData = adminDoc.data();

    // 5. Success: Delete OTP document
    await deleteDoc(otpDocRef);

    // 6. Generate JWT Session Token
    const jwtSecret = process.env.JWT_SECRET || 'bujji_cellulars_secure_admin_jwt_secret_key_32_chars';
    const payload = {
      id: adminDoc.id,
      email: email,
      role: adminData.role || 'admin'
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '2h' });

    // 7. Store JWT in Secure HTTP-Only Cookie
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
      message: 'OTP verified successfully. Session established.',
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
