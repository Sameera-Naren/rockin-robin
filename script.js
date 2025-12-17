// ==========================================
// STRANGER THINGS WALL - SPLIT SCREEN TEST
// ==========================================

// 1. CONNECT
const socket = io(); 
const myId = Math.random().toString(36).substring(7);

// 2. AUDIO ELEMENTS
const ambientHum = document.getElementById('ambient-hum-audio');
const staticFlash = document.getElementById('static-flash-audio');

// ------------------------------------------------
// RECEIVER LOGIC (The Wall)
// ------------------------------------------------
socket.on('flash_wall', (text) => {
    console.log("The Wall is lighting up for:", text);
    // Convert to Upper Case just in case
    triggerWallSequence(text.toUpperCase());
});

// ------------------------------------------------
// SENDER LOGIC (The Controller)
// ------------------------------------------------
function sendCommunication() {
    const input = document.getElementById('message-input');
    // If input exists (we are on controller page)
    if (input) {
        const message = input.value.trim();
        if (message) {
            console.log("Sending:", message);
            
            // Send to Server
            socket.emit('typing_event', {
                sender: myId,
                text: message
            });
            
            input.value = ''; // Clear box
        }
    }
}

// ------------------------------------------------
// ANIMATION LOGIC (Your Original Code)
// ------------------------------------------------
function triggerWallSequence(msg) {
    if (ambientHum) {
        ambientHum.currentTime = 0;
        ambientHum.play().catch(() => console.log("Audio waiting for click..."));
    }

    chaosFlash(() => {
        if (ambientHum) ambientHum.pause(); 
        
        setTimeout(() => {
            displayMessage(msg);
        }, 2000);
    });
}

function displayMessage(message) {
    const chars = message.split('');
    let delay = 0;
    
    chars.forEach((char) => {
        if (char >= 'A' && char <= 'Z') {
            setTimeout(() => {
                const light = document.getElementById(`light-${char}`);
                if (light) {
                    if (staticFlash) {
                        const sound = staticFlash.cloneNode();
                        sound.volume = 0.6;
                        sound.play().catch(e=>{});
                    }
                    light.classList.add('lit');
                    setTimeout(() => light.classList.remove('lit'), 1000);
                }
            }, delay);
            delay += 1200; 
        } else {
            delay += 600; 
        }
    });
}

function chaosFlash(callback) {
    const allLights = document.querySelectorAll('.light-bulb');
    if(allLights.length === 0) {
        // If we are on the controller page, there are no lights, so skip immediately
        if(callback) callback();
        return;
    }

    const interval = setInterval(() => {
        allLights.forEach(l => l.classList.remove('lit'));
        const random = allLights[Math.floor(Math.random() * allLights.length)];
        if (random) random.classList.add('lit');
    }, 60);

    setTimeout(() => {
        clearInterval(interval);
        allLights.forEach(l => l.classList.remove('lit'));
        if (callback) callback(); 
    }, 4000);
}

function toggleUpsideDown() {
    const wrapper = document.getElementById('main-layout-wrapper');
    const btn = document.getElementById('upside-down-toggle');
    if(wrapper) {
        wrapper.classList.toggle('upside-down-active');
        if (wrapper.classList.contains('upside-down-active')) {
            btn.textContent = "Flip to Normal Mode";
        } else {
            btn.textContent = "Flip to Upside Down";
        }
    }
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Controller Setup
    const sendBtn = document.getElementById('send-button');
    if (sendBtn) sendBtn.addEventListener('click', sendCommunication);
    
    const inputField = document.getElementById('message-input');
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendCommunication();
        });
    }

    // Toggle Button
    const toggleBtn = document.getElementById('upside-down-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleUpsideDown);
});