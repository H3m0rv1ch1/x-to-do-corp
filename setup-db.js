// Setup Supabase Database Schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbtyxpahkxdhiowvnedu.supabase.co';
const accessToken = 'sbp_b28719fe2b05a8f363373b3edf0aaaf09d51ab55';

// Create client with service role for admin operations
const supabase = createClient(supabaseUrl, accessToken);

const schema = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT DEFAULT '',
  name TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  banner_url TEXT,
  verification_type TEXT DEFAULT 'none',
  organization TEXT,
  organization_avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  image_url TEXT,
  due_date TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TEXT NOT NULL,
  subtasks JSONB DEFAULT '[]',
  notified TEXT,
  completed_at TEXT,
  recurrence_rule TEXT,
  reminder_offset INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Todos policies
DROP POLICY IF EXISTS "Users can view their own todos" ON todos;
CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own todos" ON todos;
CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own todos" ON todos;
CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own todos" ON todos;
CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1), 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

async function setup() {
  try {
    console.log('🚀 Setting up Supabase database...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error:', error.message);
      console.log('\n⚠️  The access token might not have admin privileges.');
      console.log('Please run the SQL manually in Supabase dashboard:');
      console.log('https://supabase.com/dashboard/project/xbtyxpahkxdhiowvnedu/sql');
    } else {
      console.log('✅ Database setup complete!');
    }
  } catch (err) {
    console.error('❌ Failed:', err.message);
    console.log('\n📝 Please run supabase-schema.sql in your Supabase dashboard.');
  }
}

setup();
