import { getSupabase } from './supabase';

/** Upload a Buffer/File to Supabase Storage and return the public URL */
export async function uploadToSupabase(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  pathPrefix: string = 'projects'
): Promise<string> {
  const { randomUUID } = await import('crypto');
  const supabase = getSupabase();
  const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'project-images';

  const ext         = filename.slice(filename.lastIndexOf('.'));
  const uniqueName   = `${pathPrefix}/${randomUUID()}${ext}`;

  const { data, error } = await supabase.storage
    .from(storageBucket)
    .upload(uniqueName, buffer, {
      contentType:       mimeType,
      cacheControl:      '3600',
      upsert:            false,
    });

  if (error || !data) {
    throw new Error(`Supabase storage upload failed: ${error?.message ?? 'unknown error'}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(storageBucket)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
