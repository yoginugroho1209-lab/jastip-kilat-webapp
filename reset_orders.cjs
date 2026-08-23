const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://unzqpjpttwlvoycvofwh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuenFwanB0dHdsdm95Y3ZvZndoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM5MTIwMiwiZXhwIjoyMTAyOTY3MjAyfQ.xwb59LL2sHUqplgOIrhBVyoLWnW9uGjDqsXSlOAVnrg'
);

async function reset() {
  console.log("Deleting all order_items...");
  const { error: e1 } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e1) console.error("order_items error:", e1.message);
  else console.log("order_items cleared");

  console.log("Deleting all refunds...");
  const { error: e2 } = await supabase.from('refunds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e2) console.error("refunds error:", e2.message);
  else console.log("refunds cleared");

  console.log("Deleting all orders...");
  const { error: e3 } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e3) console.error("orders error:", e3.message);
  else console.log("orders cleared");

  // Also clean SOS/LAPORAN tags from driver vehicles
  console.log("Cleaning SOS/LAPORAN tags from drivers...");
  const { data: drivers } = await supabase.from('drivers').select('id, vehicle');
  if (drivers) {
    for (const d of drivers) {
      const v = d.vehicle || '';
      if (v.includes('| SOS:') || v.includes('| LAPORAN:') || v.includes('| NOTES:')) {
        let clean = v.split('| SOS:')[0].split('| LAPORAN:')[0].split('| NOTES:')[0].trim();
        await supabase.from('drivers').update({ vehicle: clean }).eq('id', d.id);
        console.log('  Cleaned vehicle for driver ' + d.id);
      }
    }
  }
  console.log("Driver tags cleaned");

  console.log("\nReset complete! Ready for testing.");
}

reset();
