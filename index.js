import express from "express";
import CryptoJS from "crypto-js";
const app = express();

const IV_STRING = "1234567890123456"; // 16-byte IV
const KEY_STRING = "12345678901234567890123456789012"; // 32-byte key

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "success", message: "API is running!" });
});

// ✅ Encrypt for URL
export function encryptURLParam(data) {
  if (data) {
    const key = CryptoJS.enc.Utf8.parse(KEY_STRING);
    const iv = CryptoJS.enc.Utf8.parse(IV_STRING);

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    let encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    // Make it URL-safe
    return encryptedBase64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
}

export function decryptURLParam(encryptedText) {
  if (encryptedText) {
    try {
      const key = CryptoJS.enc.Utf8.parse(KEY_STRING);
      const iv = CryptoJS.enc.Utf8.parse(IV_STRING);

      // Convert URL-safe Base64 back to standard Base64
      const base64 = encryptedText
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(
          encryptedText.length + ((4 - (encryptedText.length % 4)) % 4),
          "="
        );

      const ciphertext = CryptoJS.enc.Base64.parse(base64);

      const encryptedParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext,
      });

      const decrypted = CryptoJS.AES.decrypt(encryptedParams, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      console.log(decryptedText, "decreptedtext");
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  }
}

export function decryptPayload(encryptedText) {
  try {
    const key = CryptoJS.enc.Utf8.parse(KEY_STRING);
    const iv = CryptoJS.enc.Utf8.parse(IV_STRING);

    // Convert URL-safe base64 to standard base64
    const base64 = encryptedText
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        encryptedText.length + ((4 - (encryptedText.length % 4)) % 4),
        "="
      );

    const encryptedHex = CryptoJS.enc.Base64.parse(base64);
    const encryptedParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedHex,
    });

    const decrypted = CryptoJS.AES.decrypt(encryptedParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    console.log(decryptedText, "decrypted text");
    const res = JSON.parse(decryptedText);
    console.log(res, "decrypted payload");
    return res;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

export function encryptPayload(data) {
  const key = CryptoJS.enc.Utf8.parse(KEY_STRING);
  const iv = CryptoJS.enc.Utf8.parse(IV_STRING);

  let payload = {};

  // Convert FormData to plain object
  if (data instanceof FormData) {
    data.forEach((value, key) => {
      payload[key] = value;
    });
  } else {
    payload = data;
  }

  const json = JSON.stringify(payload);

  const encrypted = CryptoJS.AES.encrypt(json, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const base64 = encrypted.toString();

  const urlSafe = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  console.log(urlSafe, "encrypted payload");
  return urlSafe;
}

app.post("/decryptResponse", async (req, res) => {
  console.log(req.body);
  const { data } = req.body;
  const resp = await decryptPayload(data);
  res.status(200).json(resp);
});

app.post("/decryptId", async (req, res) => {
  console.log(req.body);
  const { data } = req.body;
  const resp = await decryptURLParam(data);
  res.status(200).json(resp);
});

app.post("/encryptPayload", async (req, res) => {
  console.log(req.body);
  const resp = await encryptPayload(req.body);
  res.status(200).json(resp);
});

app.post("/decryptId", async (req, res) => {
  console.log(req.body);
  const { data } = req.body;
  const resp = await decryptURLParam(data);
  res.status(200).json(resp);
});

app.listen(5000, () => {
  console.log("running on port 5000");
});
