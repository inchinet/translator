// Language Configuration
// Map display names to { speech: BCP-47 code, translate: Google Translate ISO code }
// Note: Google Translate 'gtx' API often uses different codes than Web Speech API.
// Cantonese: Speech 'zh-HK', Translate 'zh-TW' (Traditional)
// Mandarin: Speech 'zh-CN', Translate 'zh-CN' (Simplified)

const LANGUAGES = {
    'yue': { name: 'Cantonese (廣東話)', speech: 'zh-HK', translate: 'yue' },
    'zh': { name: 'Mandarin (國語)', speech: 'zh-CN', translate: 'zh-CN' },
    'en': { name: 'English', speech: 'en-US', translate: 'en' },
    'ja': { name: 'Japanese (日本語)', speech: 'ja-JP', translate: 'ja' },
    'ko': { name: 'Korean (한국어)', speech: 'ko-KR', translate: 'ko' },
    'fr': { name: 'French (Français)', speech: 'fr-FR', translate: 'fr' },
    'de': { name: 'German (Deutsch)', speech: 'de-DE', translate: 'de' }
};

// State
let state = {
    sourceLang: 'yue', // Default Cantonese
    destLang: 'ja',    // Default Japanese
    isListening: false,
    listeningSide: null // 'source' or 'dest'
};

// DOM Elements
const sourceSelect = document.getElementById('source-select');
const destSelect = document.getElementById('dest-select');
const sourceText = document.getElementById('source-text');
const destText = document.getElementById('dest-text');
const sourceMic = document.getElementById('source-mic');
const destMic = document.getElementById('dest-mic');
const sourceVolume = document.getElementById('source-volume');
const destVolume = document.getElementById('dest-volume');
const swapBtn = document.getElementById('swap-btn');

// Initialization
function init() {
    populateSelects();
    setupEventListeners();
    setupSpeechRecognition();
}

function populateSelects() {
    for (const [key, value] of Object.entries(LANGUAGES)) {
        const option1 = new Option(value.name, key);
        const option2 = new Option(value.name, key);
        sourceSelect.add(option1);
        destSelect.add(option2);
    }
    sourceSelect.value = state.sourceLang;
    destSelect.value = state.destLang;
}

function setupEventListeners() {
    sourceSelect.addEventListener('change', (e) => state.sourceLang = e.target.value);
    destSelect.addEventListener('change', (e) => state.destLang = e.target.value);

    swapBtn.addEventListener('click', () => {
        // Swap Languages
        const tempLang = state.sourceLang;
        state.sourceLang = state.destLang;
        state.destLang = tempLang;
        sourceSelect.value = state.sourceLang;
        destSelect.value = state.destLang;

        // Swap Text Content
        const tempText = sourceText.value;
        sourceText.value = destText.value;
        destText.value = tempText;
    });

    sourceMic.addEventListener('click', () => toggleListening('source'));
    destMic.addEventListener('click', () => toggleListening('dest'));

    sourceVolume.addEventListener('click', () => speakText(sourceText.value, state.sourceLang));
    destVolume.addEventListener('click', () => speakText(destText.value, state.destLang));
}

// Speech Recognition Setup
let recognition;
function setupSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech Recognition not supported in this browser. Please use Chrome.");
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSpeechResult(transcript);
    };

    recognition.onend = () => {
        stopListeningUI();
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        stopListeningUI();
    };
}

function toggleListening(side) {
    if (state.isListening) {
        recognition.stop();
        if (state.listeningSide === side) {
            // Just stopping
            return;
        }
        // If switching sides, wait a bit usually, but for simplicity we rely on 'onend' resetting state
        // For now, let's just stop. User clicks again to start.
        return;
    }

    state.listeningSide = side;
    state.isListening = true;

    // Set language
    const langKey = side === 'source' ? state.sourceLang : state.destLang;
    recognition.lang = LANGUAGES[langKey].speech;

    recognition.start();
    updateListeningUI(side, true);
}

function stopListeningUI() {
    state.isListening = false;
    state.listeningSide = null;
    sourceMic.classList.remove('listening');
    destMic.classList.remove('listening');
    document.getElementById('source-box').classList.remove('active-listening');
    document.getElementById('dest-box').classList.remove('active-listening');
}

function updateListeningUI(side, active) {
    const mic = side === 'source' ? sourceMic : destMic;
    const box = side === 'source' ? document.getElementById('source-box') : document.getElementById('dest-box');

    if (active) {
        mic.classList.add('listening');
        box.classList.add('active-listening');
    }
}

async function handleSpeechResult(text) {
    if (state.listeningSide === 'source') {
        sourceText.value = text;
        await translate(text, state.sourceLang, state.destLang, 'dest');
    } else {
        destText.value = text;
        await translate(text, state.destLang, state.sourceLang, 'source');
    }
}

async function translate(text, fromLangKey, toLangKey, targetBox) {
    if (!text) return;

    const sl = LANGUAGES[fromLangKey].translate;
    const tl = LANGUAGES[toLangKey].translate;

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();

        // Data format: [[["Translation", "Original", null, null, 1]], ...]
        const translatedText = data[0].map(item => item[0]).join('');

        if (targetBox === 'dest') {
            destText.value = translatedText;
            speakText(translatedText, toLangKey);
        } else {
            sourceText.value = translatedText;
            speakText(translatedText, toLangKey);
        }

    } catch (error) {
        console.error("Translation error:", error);
        alert("Translation failed. Check console.");
    }
}

function speakText(text, langKey) {
    if (!text) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop previous

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGES[langKey].speech;

    // Optional: Try to find a matching voice better than default
    // const voices = window.speechSynthesis.getVoices();
    // const matchingVoice = voices.find(v => v.lang === utterance.lang);
    // if (matchingVoice) utterance.voice = matchingVoice;

    window.speechSynthesis.speak(utterance);
}

// Load voices async
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
    };
}

// Run
document.addEventListener('DOMContentLoaded', init);
