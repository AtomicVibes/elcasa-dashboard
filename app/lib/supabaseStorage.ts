import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'project-images';

/** Upload a Buffer/File to Supabase Storage and return the public URL */
export async function uploadToSupabase(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  pathPrefix: string = 'projects'
): Promise<string> {
  const ext         = filename.slice(filename.lastIndexOf('.'));
  const uniqueName   = `${pathPrefix}/${randomUUID()}${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(uniqueName, buffer, {
      contentType:       mimeType,
      cacheControl:      '3600',
      upsert:            false,
    });

  if (error || !data) {
    throw new Error(`Supabase storage upload failed: ${error?.message ?? 'unknown error'}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
