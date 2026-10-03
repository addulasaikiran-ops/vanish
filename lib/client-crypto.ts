const encoder = new TextEncoder();
const decoder = new TextDecoder();

function asBufferSource(bytes: Uint8Array): BufferSource {
  return bytes as unknown as BufferSource;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function encryptText(text: string) {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = new Uint8Array(crypto.getRandomValues(new Uint8Array(12)));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: asBufferSource(iv) },
    key,
    asBufferSource(encoder.encode(text))
  );

  const rawKey = await crypto.subtle.exportKey("raw", key);

  return {
    ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
    iv: bytesToBase64Url(iv),
    key: bytesToBase64Url(new Uint8Array(rawKey)),
  };
}

export async function decryptText(
  ciphertext: string,
  iv: string,
  keyValue: string
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    asBufferSource(base64UrlToBytes(keyValue)),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: asBufferSource(base64UrlToBytes(iv)) },
    key,
    asBufferSource(base64UrlToBytes(ciphertext))
  );

  return decoder.decode(plaintext);
}
