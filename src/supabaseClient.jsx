import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://okadhzfrutumdlfrgtaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rYWRoemZydXR1bWRsZnJndGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5OTk4NDEsImV4cCI6MjA1MzU3NTg0MX0.63Llxl1eKJS_dJPKtyri84FmERbxNdgoriIU2c05NSE';



export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
