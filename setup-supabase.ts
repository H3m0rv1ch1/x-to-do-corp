// Run this with: npx tsx setup-supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbtyxpahkxdhiowvnedu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhidHl4cGFoa3hkaGlvd3ZuZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTk1MzksImV4cCI6MjA3ODA5NTUzOX0.KUqKd2xEL7tWkYF-Gn0N-3NCvWHCMMGFxc9x7nmv3vc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('⚠️  Note: This script cannot create tables with the anon key.');
  console.log('You need to run the SQL in supabase-schema.sql in your Supabase dashboard.');
  console.log('\nSteps:');
  console.log('1. Go to https://supabase.com/dashboard/project/xbtyxpahkxdhiowvnedu/sql');
  console.log('2. Click "New Query"');
  console.log('3. Copy the contents of supabase-schema.sql');
  console.log('4. Paste and click "Run"');
  console.log('\nThis will create the profiles and todos tables with proper security policies.');
}

setupDatabase();
