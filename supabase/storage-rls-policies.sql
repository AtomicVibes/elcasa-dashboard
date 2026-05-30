-- ─────────────────────────────────────────────────────────────
--  RLS policies for the "Photos" storage bucket
--  Run this in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Allow authenticated users to INSERT (upload) into "Photos"
CREATE POLICY "Authenticated users can upload to Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Photos'
);

-- 2. Allow authenticated users to UPDATE objects in "Photos"
CREATE POLICY "Authenticated users can update Photos objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'Photos' AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'Photos' AND auth.role() = 'authenticated'
);

-- 3. Allow public (unauthenticated) read access to "Photos"
--    Required so the dashboard can display uploaded images/PDFs
--    from the public URL without exposing anon key.
CREATE POLICY "Public can read Photos objects"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'Photos'
);
