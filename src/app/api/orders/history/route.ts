export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET order history for a customer by phone number
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menus (*)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (phone) {
    query = query.eq('customer_phone', phone);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
