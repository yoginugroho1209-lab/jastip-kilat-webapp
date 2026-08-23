export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/drivers/auth
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phone, name, vehicle } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Nomor WhatsApp wajib diisi' }, { status: 400 });
    }

    if (action === 'login') {
      const { pin } = body;
      // Find driver by phone
      const { data: driver, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error || !driver) {
        return NextResponse.json({ error: 'Nomor WhatsApp tidak ditemukan. Silakan daftar melalui admin.' }, { status: 404 });
      }

      // Check PIN
      if (driver.pin !== pin) {
        return NextResponse.json({ error: 'PIN salah.' }, { status: 401 });
      }

      return NextResponse.json({ 
        success: true, 
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          status: driver.status, // 'pending' or 'active'
        }
      });
    } 
    
    else if (action === 'register') {
      if (!name || !vehicle) {
        return NextResponse.json({ error: 'Nama dan Kendaraan wajib diisi' }, { status: 400 });
      }

      // Check if phone already exists
      const { data: existing } = await supabase
        .from('drivers')
        .select('id, status')
        .eq('phone', phone)
        .single();

      if (existing) {
        if (existing.status === 'rejected' || existing.status === 'terminated') {
          // Allow re-registration by deleting the old record first
          await supabase.from('drivers').delete().eq('id', existing.id);
        } else {
          return NextResponse.json({ error: 'Nomor WhatsApp sudah terdaftar. Silakan login atau gunakan nomor lain.' }, { status: 400 });
        }
      }

      // Check if email already exists (parsed from vehicle string: "Motor | EMAIL: user@gmail.com")
      const emailMatch = vehicle.match(/\|\s*EMAIL:\s*(.+)$/i);
      if (emailMatch && emailMatch[1]) {
        const email = emailMatch[1].trim();
        const { data: existingEmail } = await supabase
          .from('drivers')
          .select('id, status')
          .ilike('vehicle', `%EMAIL: ${email}%`)
          .limit(1);

        if (existingEmail && existingEmail.length > 0) {
          if (existingEmail[0].status === 'rejected' || existingEmail[0].status === 'terminated') {
            await supabase.from('drivers').delete().eq('id', existingEmail[0].id);
          } else {
            return NextResponse.json({ error: 'Alamat Email sudah terdaftar. Silakan gunakan email lain.' }, { status: 400 });
          }
        }
      }

      // Generate unique 4-digit PIN
      let pinStr = '';
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const pinNum = Math.floor(1000 + Math.random() * 9000);
        pinStr = pinNum.toString();
        const { data: existingPins } = await supabase
          .from('drivers')
          .select('id')
          .eq('pin', pinStr)
          .limit(1);
        if (!existingPins || existingPins.length === 0) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        // Fallback if somehow 10 collisions happen
        pinStr = Math.floor(1000 + Math.random() * 9000).toString();
      }

      // Insert new driver with status 'pending'
      const { data: newDriver, error: insertError } = await supabase
        .from('drivers')
        .insert({
          name,
          phone,
          vehicle,
          status: 'pending', // Must pay to become active
          pin: pinStr,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        driver: {
          id: newDriver.id,
          name: newDriver.name,
          phone: newDriver.phone,
          status: newDriver.status,
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
