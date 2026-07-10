import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhxiatzktmaixyzstusf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeGlhdHprdG1haXh5enN0dXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NzE5MzgsImV4cCI6MjA5OTI0NzkzOH0.-mH3owSNIWVhdlz49PJ0dLfs27ZEkn69coBA-BMl104';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
