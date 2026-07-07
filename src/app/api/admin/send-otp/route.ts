import { NextResponse } from 'next/server';
import { db } from '@/backend/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { sendOtpEmail } from '@/backend/email';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    // 1. Verify if user is an admin
    const q = query(collection(db, 'admin_users'), where('email', '==', email));
    const adminSnap = await getDocs(q);
    if (adminSnap.empty) {
      return NextResponse.json({ success: false, error: 'Access denied. Unauthorized administrator.' }, { status: 403 });
    }

    // 2. Check rate limit / last sent time
    const otpDocRef = doc(db, 'admin_otps', email);
    const otpDocSnap = await getDoc(otpDocRef);
    
    if (otpDocSnap.exists()) {
      const data = otpDocSnap.data();
      const lastSent = data.lastSent ? new Date(data.lastSent).getTime() : 0;
      const now = Date.now();
      const cooldown = 60 * 1000; // 60 seconds cooldown
      
      if (now - lastSent < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastSent)) / 1000);
        return NextResponse.json({
          success: false,
          error: `Please wait ${remaining} seconds before requesting a new OTP.`
        }, { status: 429 });
      }
    }

    // 3. Generate secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 6); // low salt rounds for speed
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration

    // 4. Save to Firestore
    await setDoc(otpDocRef, {
      email,
      otp: hashedOtp,
      expiresAt,
      attempts: 0,
      lastSent: new Date().toISOString()
    });

    // 5. Dispatch email
    const emailRes = await sendOtpEmail(email, otp);
    if (!emailRes.success) {
      return NextResponse.json({ success: false, error: 'Failed to send OTP email.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verification code dispatched successfully.',
      simulated: !!emailRes.simulated
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
