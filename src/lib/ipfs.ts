/**
 * Upload a file to Pinata IPFS via our API route
 */
export async function uploadToPinata(
  file: File,
  name: string,
  description: string
): Promise<{ imageUrl: string; metadataUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("description", description);

  const res = await fetch("/api/pinata/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload to IPFS");
  }

  return res.json();
}
