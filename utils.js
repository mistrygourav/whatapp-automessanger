import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const accessToken =process.env.ACCESS_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;
const recipientNumber = process.env.RECIPIENT_NUMBER;

if (!accessToken || !phoneNumberId || !recipientNumber) {
  console.error('❌ Missing environment variables. Please set ACCESS_TOKEN, PHONE_NUMBER_ID, and RECIPIENT_NUMBER.');
  process.exit(1);
}

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

export async function uploadMedia(filePath, mimeType) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('type', mimeType);
    console.log('🔍 Uploading:', filePath, 'as', mimeType);
    const res = await axiosInstance.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/media?messaging_product=whatsapp`,
      form,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...form.getHeaders()
        }
      }
    );

    console.log('📦 Upload success:', res.data);
    return res.data.id;
  } catch (err) {
    console.error('❌ Upload failed:', err.response.data || err.message);
    return null;
  }
}

export async function sendText(text) {
  const res = await axiosInstance.post(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: recipientNumber,
      type: 'text',
      text: { body: text }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  console.log('📤 text send response:', res.data);
}

export async function sendAudio(mediaId) {
  const res = await axiosInstance.post(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: recipientNumber,
      type: 'audio',
      audio: { id: mediaId }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  console.log('📤 Audio send response:', res.data);
}

export async function sendImage(mediaId) {
  await axiosInstance.post(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: recipientNumber,
      type: 'image',
      image: { id: mediaId }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
}