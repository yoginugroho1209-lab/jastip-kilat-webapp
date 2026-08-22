import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all menus
export async function GET() {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PATCH to update menu availability
export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, is_available } = body;

  if (!id) {
    return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('menus')
    .update({ is_available })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
