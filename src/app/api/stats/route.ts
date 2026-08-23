import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET real platform stats for Founder Dashboard
// Works without requiring new columns on orders table
export async function GET() {
  // Get all order items to compute total items sold
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('quantity, order_id');

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Get all orders for status counts (only columns that exist)
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, status, delivery_fee, created_at');

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const totalItemsSold = (orderItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const platformFeePerItem = 500;
  const grossRevenue = totalItemsSold * platformFeePerItem;

  const totalOrders = (orders || []).length;
  const activeOrders = (orders || []).filter(o => !['delivered', 'cancelled', 'failed'].includes(o.status)).length;
  const completedOrders = (orders || []).filter(o => o.status === 'delivered').length;
  const totalDeliveryFees = (orders || []).reduce((sum, o) => sum + (o.delivery_fee || 0), 0);

  return NextResponse.json({
    totalItemsSold,
    grossRevenue,
    platformFeePerItem,
    totalOrders,
    activeOrders,
    completedOrders,
    totalDeliveryFees
  });
}
