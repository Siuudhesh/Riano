import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qqgccceaveprmssqgajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZ2NjY2VhdmVwcm1zc3FnYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NDYxNDYsImV4cCI6MjA1NTUyMjE0Nn0.TvFIsvjoxZBin7MnpnbJfNLlJn4WdHyuqQSoAiCaORw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
