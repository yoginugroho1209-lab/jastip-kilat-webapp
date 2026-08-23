export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/drivers/subscribe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driver_id, package_type } = body;

    if (!driver_id || !package_type) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Update driver status to 'active'
    // In a real app, you would also save the subscription_expired_at date to DB
    const { data: updatedDriver, error } = await supabase
      .from('drivers')
      .update({ status: 'active' })
      .eq('id', driver_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate Expiry Date for Simulation
    const now = new Date();
    if (package_type === 'harian') {
      now.setHours(now.getHours() + 24); // 24 hours from now
    } else if (package_type === 'permanen') {
      now.setFullYear(now.getFullYear() + 100); // 100 years from now
    }

    return NextResponse.json({ 
      success: true,
      message: `Langganan berhasil diaktifkan.`,
      driver: {
        id: updatedDriver.id,
        name: updatedDriver.name,
        status: updatedDriver.status,
        expires_at: now.toISOString() // Pass expiry to frontend
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
