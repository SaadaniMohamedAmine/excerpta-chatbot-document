// lib/storage/blob.ts
import { put, del } from "@vercel/blob";

export async function uploadFile(
  file: File | Blob,
  pathname: string
): Promise<{ url: string; pathname: string; contentType: string }> {
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url, pathname: blob.pathname, contentType: blob.contentType };
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}
