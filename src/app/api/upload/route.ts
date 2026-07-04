import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    return NextResponse.json({
      success: true,
      url: '/images/avatar-placeholder.svg',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Upload simulation failed' }, { status: 500 });
  }
}
