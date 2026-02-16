import { createClient } from '@supabase/supabase-js';
import env, { isSupabaseConfigured } from './env';

export const supabase = isSupabaseConfigured
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : null;

// Storage helpers
export function getPublicUrl(bucket, path) {
  if (!supabase || !path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}

export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  if (!supabase || !path) return null;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) {
    console.error('Signed URL error:', error);
    return null;
  }
  return data?.signedUrl || null;
}

export async function uploadFile(bucket, path, file) {
  if (!supabase) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: true });
  return { data, error };
}

export async function deleteFile(bucket, path) {
  if (!supabase) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.storage.from(bucket).remove([path]);
  return { data, error };
}
