const DEFAULT_BUCKET = 'skin-photos';

function config() {
  const baseURL = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!baseURL || !secret) throw new Error('PHOTO_STORAGE_NOT_CONFIGURED');
  return { baseURL: baseURL.replace(/\/$/, ''), secret, bucket: process.env.SUPABASE_PHOTO_BUCKET ?? DEFAULT_BUCKET };
}

function headers(contentType?: string) {
  const { secret } = config();
  return { apikey: secret, authorization: `Bearer ${secret}`, ...(contentType ? { 'content-type': contentType } : {}) };
}

export async function uploadPrivatePhoto(key: string, bytes: ArrayBuffer, contentType: string) {
  const { baseURL, bucket } = config();
  const response = await fetch(`${baseURL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`, {
    method: 'POST', headers: { ...headers(contentType), 'x-upsert': 'false', 'cache-control': 'no-store' }, body: bytes,
  });
  if (!response.ok) throw new Error('PHOTO_STORAGE_UPLOAD_FAILED');
}

export async function deletePrivatePhoto(key: string) {
  const { baseURL, bucket } = config();
  const response = await fetch(`${baseURL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`, { method: 'DELETE', headers: headers() });
  if (!response.ok && response.status !== 404) throw new Error('PHOTO_STORAGE_DELETE_FAILED');
}

export async function createPrivatePhotoURL(key: string): Promise<string> {
  const { baseURL, bucket } = config();
  const response = await fetch(`${baseURL}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`, {
    method: 'POST', headers: headers('application/json'), body: JSON.stringify({ expiresIn: 60 }), cache: 'no-store',
  });
  if (!response.ok) throw new Error('PHOTO_STORAGE_SIGN_FAILED');
  const body = await response.json() as { signedURL?: string };
  if (!body.signedURL) throw new Error('PHOTO_STORAGE_SIGN_FAILED');
  return body.signedURL.startsWith('http') ? body.signedURL : `${baseURL}/storage/v1${body.signedURL}`;
}
