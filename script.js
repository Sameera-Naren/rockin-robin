const socket = io();

// --- 1. SENDER LOGIC (Controller) ---
const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-button');

if (input && sendBtn) {
    // Function to send data
    function sendMessage() {
        const text = input.value.trim().toUpperCase();
        if (text) {
            if (text.includes("CODE RED")) {
                console.log("Sending CODE RED...");
                socket.emit('code_red_trigger');
                document.body.style.background = "red"; // Visual feedback
                setTimeout(() => document.body.style.background = "#050000", 500);
            } else {
                console.log("Sending to Wall:", text);
                socket.emit('typing_event', { text: text });
            }
            input.value = "";
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// --- 2. RECEIVER LOGIC (Wall) ---
const wallContainer = document.getElementById('communication-wall');
const ambientHum = document.getElementById('ambient-hum-audio');
const staticFlash = document.getElementById('static-flash-audio');

if (wallContainer) {
    // Enable Audio on first click
    document.body.addEventListener('click', () => {
        if (ambientHum) ambientHum.play().catch(e => {});
    });

    socket.on('flash_wall', (text) => {
        console.log("Wall received:", text);
        triggerSequence(text);
    });

    function triggerSequence(text) {
        // Phase 1: Chaos Flash (Stranger Things style)
        let chaosCount = 0;
        const chaosInterval = setInterval(() => {
            document.querySelectorAll('.lit').forEach(l => l.classList.remove('lit'));
            const bulbs = document.querySelectorAll('.light-bulb');
            const random = bulbs[Math.floor(Math.random() * bulbs.length)];
            random.classList.add('lit');
            chaosCount++;
            if (chaosCount > 10) { // Stop chaos after 10 flashes
                clearInterval(chaosInterval);
                document.querySelectorAll('.lit').forEach(l => l.classList.remove('lit'));
                
                // Phase 2: Spell Message
                setTimeout(() => spellMessage(text), 1000);
            }
        }, 100);
    }

    function spellMessage(text) {
        const chars = text.split('');
        let delay = 0;

        chars.forEach(char => {
            if (char >= 'A' && char <= 'Z') {
                setTimeout(() => {
                    const bulb = document.getElementById(`light-${char}`);
                    if (bulb) {
                        // Play Sound
                        if (staticFlash) {
                            const sound = staticFlash.cloneNode();
                            sound.volume = 0.5;
                            sound.play().catch(e=>{});
                        }
                        // Light Up
                        bulb.classList.add('lit');
                        setTimeout(() => bulb.classList.remove('lit'), 800);
                    }
                }, delay);
                delay += 1200; // Wait before next letter
            } else {
                delay += 500; // Space
            }
        });
    }
}
