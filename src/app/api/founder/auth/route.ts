import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();
    
    // Hardcoded credentials for Founder
    // Server-side execution guarantees these do not leak to client JS
    const VALID_PHONE = '087796747423';
    const VALID_PIN = '878765';
    
    if (phone === VALID_PHONE && pin === VALID_PIN) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: 'Nomor WA atau PIN salah' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
