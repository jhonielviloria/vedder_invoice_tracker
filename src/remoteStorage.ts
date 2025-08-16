import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AppDataSchema, Client, InvoiceCellData } from './types';

const CLIENTS_TABLE = 'clients';
const INVOICES_TABLE = 'invoices';

// Store months in DB as 1-12 while app uses 0-11 internally
const ONE_BASED_MONTH = true;

export function localInvoiceId(clientId: string, year: number, zeroMonth: number) {
  return `${clientId}:${year}-${String(zeroMonth + 1).padStart(2,'0')}`;
}

export async function fetchRemoteData(userId: string): Promise<AppDataSchema> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
  const [clientsRes, invoicesRes] = await Promise.all([
    supabase.from(CLIENTS_TABLE).select('*').eq('user_id', userId).order('name'),
    supabase.from(INVOICES_TABLE).select('*').eq('user_id', userId)
  ]);
  if (clientsRes.error) throw clientsRes.error;
  if (invoicesRes.error) throw invoicesRes.error;

  const clients: Client[] = (clientsRes.data || []).map(r => ({
    id: r.id,
    name: r.name,
    frequency: r.frequency,
    instructions: r.instructions ?? '',
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || r.created_at || ''
  }));

  const invoices: Record<string, InvoiceCellData> = {};
  (invoicesRes.data || []).forEach(r => {
    const zeroMonth = ONE_BASED_MONTH ? (r.month - 1) : r.month;
    const localId = localInvoiceId(r.client_id, r.year, zeroMonth);
    invoices[localId] = {
      id: localId,
      clientId: r.client_id,
      year: r.year,
      month: zeroMonth,
      status: r.status,
      notes: r.notes || '',
      updatedAt: r.updated_at || ''
    };
  });

  return { clients, invoices, version: 1 };
}

export async function upsertRemoteClient(userId: string, client: Client) {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from(CLIENTS_TABLE).upsert({
    id: client.id,
    user_id: userId,
    name: client.name,
    frequency: client.frequency,
    instructions: client.instructions
  }, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteRemoteClient(userId: string, clientId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from(CLIENTS_TABLE).delete().eq('user_id', userId).eq('id', clientId);
  if (error) throw error;
}

export async function upsertRemoteInvoiceCell(userId: string, cell: InvoiceCellData) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[Supabase] Not configured, skipping upsert');
    return;
  }
  
  const dbMonth = ONE_BASED_MONTH ? (cell.month + 1) : cell.month;
  
  const payload = {
    client_id: cell.clientId,
    user_id: userId,
    year: cell.year,
    month: dbMonth,
    status: cell.status,
    notes: cell.notes || ''
  };

  // Debug log - show exactly what we're sending
  console.debug('[Supabase] Upserting invoice with payload:', JSON.stringify(payload, null, 2));
  console.debug('[Supabase] User ID:', userId);
  console.debug('[Supabase] Cell data:', JSON.stringify(cell, null, 2));
  
  try {
    // Use upsert with the composite unique constraint
    const { error, data } = await supabase
      .from(INVOICES_TABLE)
      .upsert(payload, { 
        onConflict: 'user_id,client_id,year,month',
        ignoreDuplicates: false 
      })
      .select();
      
    if (error) {
      console.error('[Supabase] Invoice upsert failed with error:', error);
      console.error('[Supabase] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('[Supabase] Invoice upsert SUCCESS! Result:', data);
  } catch (err) {
    console.error('[Supabase] Unexpected error during upsert:', err);
    throw err;
  }
}

export const SUPABASE_SCHEMA_SQL = `
-- Clients table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  frequency text not null,
  instructions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists clients_user_id_idx on public.clients(user_id);

-- Invoices table
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  year int not null,
  month int not null,
  status text not null,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, client_id, year, month)
);
create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_client_id_idx on public.invoices(client_id);

alter table public.clients enable row level security;
alter table public.invoices enable row level security;

create policy if not exists "Clients access" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Invoices access" on public.invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
`;
