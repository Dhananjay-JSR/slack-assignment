import DotEnv from "dotenv";
import path from "path";

import crypto from "crypto";
DotEnv.config({
  path: path.join(__dirname, "..", "..", "..", "..", ".env.local"),
});

const secret = process.env.SECRET!;
const salt = process.env.SALT!;

// Encrypts Access Token
export function Encrypt(text: string) {
  console.log("Salt", salt);
  console.log("Secret", secret);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secret),
    Buffer.from(salt)
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}
// Decrypts Access Token
export function Decrypt(text: string) {
  const encryptedTextBuffer = Buffer.from(text, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secret),
    Buffer.from(salt)
  );
  let decrypted = decipher.update(encryptedTextBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
