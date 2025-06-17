import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendText, sendAudio, sendImage, uploadMedia } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const startDate = new Date('2025-06-19');
const today = new Date();
const dayIndex = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
const dayFile = `messages/day${dayIndex}.json`;
const messagePath = path.join(__dirname, dayFile);
console.log(startDate, today, dayIndex, dayFile, messagePath)
if (!fs.existsSync(messagePath)) {
  console.log(`❌ No message file for today: ${dayFile}`);
  process.exit(0);
}

const messages = JSON.parse(fs.readFileSync(messagePath));
const now = new Date();

// Convert UTC to IST (UTC+5:30)
const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
const currentTime = istTime.toTimeString().substring(0, 5);
console.log('UTC Time:', now.toTimeString().substring(0, 5));
console.log('IST Time:', currentTime);
console.log('Messages:', messages);

async function sendScheduledMessages() {
  for (const msg of messages) {
    if (msg.time === currentTime) {
      console.log(`📤 Sending message scheduled for ${msg.time}`);
      if (msg.text) await sendText(msg.text);
      if (msg.audio) {
        const audioId = await uploadMedia(path.join(__dirname, 'assets', msg.audio), 'audio/ogg');
        await sendAudio(audioId);
      }
      if (msg.image) {
        const imgId = await uploadMedia(path.join(__dirname, 'assets', msg.image), 'image/jpeg');
        await sendImage(imgId);
      }
    }
  }
}

// Execute the async function
sendScheduledMessages().catch(error => {
  console.error('Error sending messages:', error.messages);
  process.exit(1);
});