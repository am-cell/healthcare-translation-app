// Gemini API Key - Replace with your key
const GEMINI_API_KEY = "AIzaSyDNvIGkXGBB9oalwGk_F9t8dWctvLfEZIk"; // Ensure this is secure

// Speech Recognition Initialization
let recognition;
const originalTextArea = document.getElementById('original-text');
const translatedTextArea = document.getElementById('translated-text');
const inputLanguageSelect = document.getElementById('input-language');
const outputLanguageSelect = document.getElementById('output-language');

document.getElementById('start-btn').addEventListener('click', () => {
    const inputLanguage = inputLanguageSelect.value;
    initializeRecognition(inputLanguage);
    recognition.start();
    originalTextArea.value = "Listening...";
});

// Initialize Speech Recognition with the selected input language
function initializeRecognition(language) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = language;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        originalTextArea.value = transcript;

        const targetLanguage = outputLanguageSelect.value;
        console.log(`Transcribing: ${transcript} to ${targetLanguage}`);

        // Call Gemini API for Translation
        const translatedText = await translateText(transcript, targetLanguage);
        console.log(`Translated Text: ${translatedText}`);
        translatedTextArea.value = translatedText;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
}

async function translateText(text, targetLanguage) {
    try {
        const prompt = `Given a medical background, give only the translation of, Translate to ${targetLanguage}: ${text}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract the translated text from the response
        const translatedText = data.candidates[0].content.parts[0].text;

        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        alert('Translation failed. Please try again later.');
        return null;
    }
}

// Play Translated Text as Audio
document.getElementById('speak-btn').addEventListener('click', () => {
    const textToSpeak = translatedTextArea.value;
    const languageCode = outputLanguageSelect.value;

    if (textToSpeak) {
        playAudio(textToSpeak, languageCode);
    } else {
        alert("No translated text available to speak!");
    }
});

function playAudio(text, lang) {
    const utterance = new SpeechSynthesisUtterance(text);

    // Map output languages to speech synthesis language codes
    const langMap = {
        hi: "hi-IN", // Hindi
        ur: "ur-PK", // Urdu
        es: "es-ES", // Spanish
        fr: "fr-FR", // French
        de: "de-DE", // German
        en: "en-US"  // English
    };

    utterance.lang = langMap[lang] || lang; // Default to lang if not mapped
    speechSynthesis.speak(utterance);
}