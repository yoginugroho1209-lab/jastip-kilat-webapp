export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET active orders (useful for Driver Dashboard)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driver_id');

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menus (*)
      ),
      drivers (*)
    `)
    .neq('status', 'delivered')
    .order('sequence', { ascending: true });

  // If driver_id is provided, only return orders for that driver
  if (driverId) {
    query = query.eq('driver_id', driverId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST new order (useful for Customer Checkout)
export async function POST(request: Request) {
  const body = await request.json();
  const { customer_name, customer_phone, dropoff_address, delivery_fee, sequence, items, driver_name, total_menu_price, status, driver_id } = body;

  // Calculate platform fee: Rp 500 per item piece
  const totalPcs = (items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const platformFee = 500 * totalPcs;
  const totalPrice = (total_menu_price || 0) + (delivery_fee || 0) + platformFee;

  // Insert Order (Only using columns that exist in DB)
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name,
      customer_phone,
      dropoff_address,
      delivery_fee,
      sequence,
      status: status || 'pending',
      ...(driver_id ? { driver_id } : {})
    })
    .select()
    .single();

  if (orderError || !orderData) {
    return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 });
  }

  // Insert Order Items
  const orderItemsData = items.map((item: any) => ({
    order_id: orderData.id,
    menu_id: item.menu_id,
    quantity: item.quantity,
    notes: item.notes || ''
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Return the full order with ID so the customer can track it
  return NextResponse.json(orderData);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status } = body;

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
