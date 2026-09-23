-- ==============================================================================
-- DUMPY: Real-Time Screenshot Inbox for Figma
-- Supabase Database Schema, Google Auth Integration & Storage Configuration
-- ==============================================================================
-- Run this SQL in your Supabase project's SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Create the Users profile table (Stores Google Sign-In details)
CREATE TABLE IF NOT EXISTS public.dumpy_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Screenshots metadata table (Stores image links and details)
CREATE TABLE IF NOT EXISTS public.dumpy_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.dumpy_users(id) ON DELETE SET NULL, -- Linked to Google User
    user_email TEXT,                                                   -- Quick email reference
    room_id TEXT NOT NULL,                                             -- Pairing Room Code (e.g. DMP-8K2N)
    file_name TEXT NOT NULL,                                           -- Original image file name
    file_url TEXT NOT NULL,                                            -- Direct public image CDN link
    storage_path TEXT NOT NULL,                                        -- Storage bucket path
    file_size BIGINT,                                                  -- Size in bytes
    width INT,                                                         -- Natural width
    height INT,                                                        -- Natural height
    mime_type TEXT DEFAULT 'image/png',                                -- MIME type
    is_inserted BOOLEAN DEFAULT false,                                 -- Insertion status into Figma
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days') -- Auto-expiry
);

-- Schema Migration Helpers (if table already existed)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dumpy_screenshots' AND column_name='user_id') THEN
        ALTER TABLE public.dumpy_screenshots ADD COLUMN user_id UUID REFERENCES public.dumpy_users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dumpy_screenshots' AND column_name='user_email') THEN
        ALTER TABLE public.dumpy_screenshots ADD COLUMN user_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dumpy_screenshots' AND column_name='expires_at') THEN
        ALTER TABLE public.dumpy_screenshots ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days');
    END IF;
END $$;

-- 3. Automatic Google User Sync Trigger
-- Automatically populates dumpy_users whenever a user signs in via Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_dumpy_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.dumpy_users (id, email, full_name, avatar_url, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and re-create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_dumpy ON auth.users;
CREATE TRIGGER on_auth_user_created_dumpy
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_dumpy_user();

-- 4. High-Performance Indexes for Live Inbox Polling
CREATE INDEX IF NOT EXISTS idx_dumpy_screenshots_room_created 
ON public.dumpy_screenshots (room_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dumpy_screenshots_user_created 
ON public.dumpy_screenshots (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dumpy_screenshots_user_email 
ON public.dumpy_screenshots (user_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dumpy_screenshots_room_inserted 
ON public.dumpy_screenshots (room_id, is_inserted);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.dumpy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dumpy_screenshots ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for dumpy_users
DROP POLICY IF EXISTS "Allow public read access on dumpy_users" ON public.dumpy_users;
CREATE POLICY "Allow public read access on dumpy_users" 
ON public.dumpy_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on dumpy_users" ON public.dumpy_users;
CREATE POLICY "Allow public insert/update on dumpy_users" 
ON public.dumpy_users FOR ALL USING (true) WITH CHECK (true);

-- 7. RLS Policies for dumpy_screenshots
DROP POLICY IF EXISTS "Allow public read on dumpy_screenshots" ON public.dumpy_screenshots;
CREATE POLICY "Allow public read on dumpy_screenshots" 
ON public.dumpy_screenshots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on dumpy_screenshots" ON public.dumpy_screenshots;
CREATE POLICY "Allow public insert on dumpy_screenshots" 
ON public.dumpy_screenshots FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on dumpy_screenshots" ON public.dumpy_screenshots;
CREATE POLICY "Allow public update on dumpy_screenshots" 
ON public.dumpy_screenshots FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on dumpy_screenshots" ON public.dumpy_screenshots;
CREATE POLICY "Allow public delete on dumpy_screenshots" 
ON public.dumpy_screenshots FOR DELETE USING (true);

-- 8. Storage Bucket 'dumpy-screenshots' Configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'dumpy-screenshots',
    'dumpy-screenshots',
    true,
    52428800, -- 50MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

-- 9. Storage Bucket RLS Policies
DROP POLICY IF EXISTS "Allow public upload to dumpy-screenshots bucket" ON storage.objects;
CREATE POLICY "Allow public upload to dumpy-screenshots bucket"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dumpy-screenshots');

DROP POLICY IF EXISTS "Allow public read from dumpy-screenshots bucket" ON storage.objects;
CREATE POLICY "Allow public read from dumpy-screenshots bucket"
ON storage.objects FOR SELECT USING (bucket_id = 'dumpy-screenshots');

DROP POLICY IF EXISTS "Allow public delete from dumpy-screenshots bucket" ON storage.objects;
CREATE POLICY "Allow public delete from dumpy-screenshots bucket"
ON storage.objects FOR DELETE USING (bucket_id = 'dumpy-screenshots');

DROP POLICY IF EXISTS "Allow public update in dumpy-screenshots bucket" ON storage.objects;
CREATE POLICY "Allow public update in dumpy-screenshots bucket"
ON storage.objects FOR UPDATE USING (bucket_id = 'dumpy-screenshots');

-- 10. Automated Temporary Screenshot Cleanup Function (7 days expiry)
CREATE OR REPLACE FUNCTION public.cleanup_expired_dumpy_screenshots()
RETURNS void AS $$
BEGIN
    DELETE FROM public.dumpy_screenshots
    WHERE created_at < NOW() - INTERVAL '7 days'
       OR (expires_at IS NOT NULL AND expires_at < NOW());
END;
$$ LANGUAGE plpgsql;
