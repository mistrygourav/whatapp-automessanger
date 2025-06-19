import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN;
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
    console.error('❌ Upload failed:', err?.response?.data || err.message);
    return null;
  }
}

export async function sendText(text) {
  try {
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
    console.log('📤 Text sent response:', res.data);
  } catch (err) {
    console.error('❌ Text message failed:', err?.response?.data || err.message);
  }
}

export async function sendAudio(mediaId) {
  try {
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
    console.log('📤 Audio sent response:', res.data);
  } catch (err) {
    console.error('❌ Audio message failed:', err?.response?.data || err.message);
  }
}

export async function sendImage(mediaId) {
  try {
    const res = await axiosInstance.post(
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
    console.log('📤 Image sent response:', res.data);
  } catch (err) {
    console.error('❌ Image message failed:', err?.response?.data || err.message);
  }
}
