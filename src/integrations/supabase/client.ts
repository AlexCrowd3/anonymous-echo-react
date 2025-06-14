import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oasqaqivfuwgourpqvhc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3FhcWl2ZnV3Z291cnBxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTAzOTgsImV4cCI6MjA2NTQyNjM5OH0._27PKLIIaH-h2Zbuna7D2EBzeEeVbyY0KjNuFk-y-os";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);