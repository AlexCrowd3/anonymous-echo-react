import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://iqzuhtxvpuxfxltiyfom.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxenVodHh2cHV4ZnhsdGl5Zm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTM3MjgsImV4cCI6MjA2Nzk4OTcyOH0.xOSkVkViX8jcFZJLmpTYqAGEu6x44UOX-ykhTgtSiRU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});