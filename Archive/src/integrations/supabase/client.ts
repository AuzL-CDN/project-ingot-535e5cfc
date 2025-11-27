import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ejctzcsegswfrkwbywte.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqY3R6Y3NlZ3N3ZnJrd2J5d3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mjk1NDMsImV4cCI6MjA3NDMwNTU0M30.lu-xf1W72mRfCdGyUDTrcohJKkRxoWEzJZv0toZ5qWs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});