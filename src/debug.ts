import { supabase } from './supabaseClient';

// Test function to verify Supabase connection and operations
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if supabase client is configured
    if (!supabase) {
      console.error('❌ Supabase client is null');
      return;
    }
    console.log('✅ Supabase client is configured');

    // Test 2: Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    if (!session) {
      console.error('❌ No active session');
      return;
    }
    console.log('✅ User authenticated:', session.user.email);

    // Test 3: Test clients table access
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);
    
    if (clientsError) {
      console.error('❌ Clients query error:', clientsError);
    } else {
      console.log('✅ Clients query success:', clients?.length, 'clients found');
    }

    // Test 4: Test invoices table access
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .limit(5);
    
    if (invoicesError) {
      console.error('❌ Invoices query error:', invoicesError);
    } else {
      console.log('✅ Invoices query success:', invoices?.length, 'invoices found');
    }

    // Test 5: Try a simple invoice upsert
    console.log('🧪 Testing invoice upsert...');
    const testPayload = {
      client_id: clients?.[0]?.id || 'test-client-id',
      user_id: session.user.id,
      year: 2025,
      month: 1,
      status: 'COMPLETED',
      notes: 'Test note from debug function'
    };

    const { data: upsertResult, error: upsertError } = await supabase
      .from('invoices')
      .upsert(testPayload, { 
        onConflict: 'user_id,client_id,year,month',
        ignoreDuplicates: false 
      })
      .select();

    if (upsertError) {
      console.error('❌ Invoice upsert error:', upsertError);
    } else {
      console.log('✅ Invoice upsert success:', upsertResult);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Make it available globally for testing in browser console
(window as any).testSupabaseConnection = testSupabaseConnection;
