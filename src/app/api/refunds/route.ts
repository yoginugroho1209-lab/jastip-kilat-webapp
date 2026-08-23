export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data: refunds, error } = await supabase
    .from('refunds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enrichedRefunds = await Promise.all((refunds || []).map(async (refund) => {
    let order = null;
    let driver = null;

    if (refund.order_id) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('customer_name, customer_phone, driver_id')
        .eq('id', refund.order_id)
        .single();
      order = orderData;

      if (order && order.driver_id) {
         const { data: driverData } = await supabase
           .from('drivers')
           .select('name, phone')
           .eq('id', order.driver_id)
           .single();
         driver = driverData;
      }
    }

    return {
       ...refund,
       orders: order ? {
          ...order,
          drivers: driver
       } : null
    };
  }));

  return NextResponse.json(enrichedRefunds);
}

// POST new refund (from Driver reporting an issue)
export async function POST(request: Request) {
  const body = await request.json();
  const { order_id, reason, amount } = body;

  if (!order_id || !reason) {
    return NextResponse.json({ error: 'order_id and reason are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('refunds')
    .insert({
      order_id,
      reason,
      amount: amount || 0,
      resolved: false
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, resolved } = body;

  if (!id) {
    return NextResponse.json({ error: 'Refund ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('refunds')
    .update({ resolved })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
