const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://unzqpjpttwlvoycvofwh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuenFwanB0dHdsdm95Y3ZvZndoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM5MTIwMiwiZXhwIjoyMTAyOTY3MjAyfQ.xwb59LL2sHUqplgOIrhBVyoLWnW9uGjDqsXSlOAVnrg'
);

async function addDriverId() {
  // Try adding driver_id column via RPC (raw SQL)
  const { error } = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id);"
  });

  if (error) {
    console.log("RPC method failed, trying direct approach...", error.message);
    // Alternative: try inserting a test row with driver_id to see if column exists
    const { data, error: e2 } = await supabase.from('orders').select('driver_id').limit(1);
    if (e2 && e2.message.includes('driver_id')) {
      console.log("Column driver_id does NOT exist yet. Please run this SQL in Supabase Dashboard:");
      console.log("\n  ALTER TABLE orders ADD COLUMN driver_id UUID REFERENCES drivers(id);\n");
    } else {
      console.log("Column driver_id already exists!");
    }
  } else {
    console.log("driver_id column added successfully!");
  }
}

addDriverId();
