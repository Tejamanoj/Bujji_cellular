import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/backend';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const res = await verifyAdminCredentials(email, password);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials verified. OTP required.',
      email,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
