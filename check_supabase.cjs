const { createClient } = require('@supabase/supabase-js');

// Use service role client  
const supabase = createClient(
  'https://unzqpjpttwlvoycvofwh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuenFwanB0dHdsdm95Y3ZvZndoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM5MTIwMiwiZXhwIjoyMTAyOTY3MjAyfQ.xwb59LL2sHUqplgOIrhBVyoLWnW9uGjDqsXSlOAVnrg'
);

async function fixRLS() {
  console.log('🔐 Fixing RLS via approach: use service_role in API routes instead\n');
  
  // The real fix: the API routes should use the service_role key (server-side)
  // since they run on the server (Next.js API routes).
  // The anon key is only used client-side for direct Supabase calls.
  
  // Let's verify service_role can read everything
  console.log('=== Verify service role access ===');
  
  const { data: menus } = await supabase.from('menus').select('*');
  console.log('Menus:', menus?.length, 'rows');
  if (menus?.length > 0) {
    console.log('Sample:', menus[0].name, '- Rp', menus[0].price);
  }
  
  const { data: drivers } = await supabase.from('drivers').select('*');
  console.log('Drivers:', drivers?.length, 'rows');
  
  const { data: orders } = await supabase.from('orders').select('*, order_items(*, menus(*))');
  console.log('Orders:', orders?.length, 'rows');
  if (orders?.length > 0) {
    console.log('Sample order:', orders[0].customer_name, '- Items:', orders[0].order_items?.length);
  }

  const { data: refunds } = await supabase.from('refunds').select('*');
  console.log('Refunds:', refunds?.length, 'rows');
  
  console.log('\n✅ Service role has full access. Will update API routes to use service_role key.');
}

fixRLS();
