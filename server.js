require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const googleTTS = require('google-tts-api');

// --- 1. CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize AI (Safely)
let model = null;
if (GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('🔌 Connected:', socket.id);

    // ==================================================
    // PART A: STRANGER THINGS LOGIC (The Lights)
    // ==================================================
    
    // 1. Normal Typing (Upside Down -> Wall)
    socket.on('typing_event', (data) => {
        io.emit('flash_wall', data.text);
    });

    // 2. Code Red Trigger (Upside Down -> Wall)
    socket.on('code_red_trigger', () => {
        console.log("🚨 CODE RED! Commanding redirection...");
        io.emit('execute_order_66'); // Tells wall.html to switch pages
    });

    // ==================================================
    // PART B: SMART VECNA LOGIC (The AI Voice)
    // ==================================================

    // 3. Wake Vecna (Index.html -> AI)
    socket.on('wake_vecna', async () => {
        console.log("💀 Vecna is waking up...");
        
        let horrorText = "I have found you.";

        // A. Generate Scary Text using Gemini
        try {
            if (model) {
                const result = await model.generateContent("You are a demon. Give a 5-word scary sentence. Seed: " + Math.random());
                horrorText = result.response.text().trim().replace(/['"]+/g, '');
            }
        } catch (e) {
            console.log("⚠️ AI Error (using backup text)");
            const backups = ["There is no escape.", "I am right here.", "Look behind you now."];
            horrorText = backups[Math.floor(Math.random() * backups.length)];
        }

        // B. Generate Audio using Google TTS
        try {
            const audioBase64 = await googleTTS.getAudioBase64(horrorText, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
                timeout: 10000,
            });
            
            // Send audio and text to the browser
            socket.emit('scare_event', { text: horrorText, audio: audioBase64 });
            
        } catch (err) {
            console.error("Audio failed:", err.message);
            // Fallback: Send text only (browser will use robot voice)
            socket.emit('scare_event', { text: horrorText, audio: null });
        }
    });
});

server.listen(3000, () => {
    console.log('✅ HYBRID SERVER READY: http://localhost:3000');
});
