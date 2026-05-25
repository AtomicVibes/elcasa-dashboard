-- Supabase SQL: profiles table + automatic row creation trigger
-- Run in Supabase SQL editor.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name text,
      phone_number text,
      "permissionRole" public.permission_role_enum DEFAULT 'USER'
    );
  END IF;
END $$;

-- Create enum if it doesn't exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_role_enum') THEN
    CREATE TYPE public.permission_role_enum AS ENUM (
      'SUPER_ADMIN',
      'ADMIN',
      'SUPER_USER',
      'USER'
    );
  END IF;
END $$;

-- Ensure column uses the enum type (if table existed but enum was created later)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'permissionRole'
  ) THEN
    -- No-op: leaving as-is if already correct. If you need migration, handle separately.
    NULL;
  END IF;
END $$;

-- Trigger function: insert profiles row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, "permissionRole")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    'USER'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

