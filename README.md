# Liquid Glass Translator

A beautiful, mobile-first bidirectional translator with a "Liquid Glass" (Glassmorphism) aesthetic. Designed for travel, it supports voice input and text-to-speech for seamless conversation.

![2-way Translator](https://github.com/inchinet/translator/blob/main/translator.png)

## Features

- **Liquid Glass UI**: Modern, translucent aesthetics with dynamic gradients.
- **Bidirectional Voice Translation**:
  - Speak in Source Language -> Translates & Speaks in Destination Language.
  - Speak in Destination Language -> Translates & Speaks in Source Language.
- **Web Speech API Support**: High-accuracy voice recognition (Chrome/Android).
- **Cantonese Support**: Special handling for Cantonese (`yue`) to ensure colloquialisms (e.g., "唔好意思") translate correctly to Standard Chinese/Mandarin.
- **Privacy Focused**: No backend server required for logic; runs entirely in the browser (uses Google Translate's public API endpoint).

## Supported Languages

- English
- Cantonese (廣東話)
- Mandarin (國語)
- Japanese (日本語)
- Korean (한국어)
- French (Français)
- German (Deutsch)

## Usage

1. **Open the App**: Simply open `index.html` in a modern web browser (Google Chrome is recommended for best Speech API support).
2. **Select Languages**: Choose your primary language (Source) and the language you want to translate to (Destination).
3. **Speak**:
   - Tap the **Mic Icon** on the *top box* to speak in the Source language.
   - Tap the **Mic Icon** on the *bottom box* to speak in the Destination language (for the other person).
4. **Listen**: The translation will be read out loud automatically. You can also tap the **Speaker Icon** to replay it.

## Technical Details

- **Frontend**: HTML5, CSS3 (Backdrop Filter), Vanilla JavaScript.
- **APIs**:
  - `webkitSpeechRecognition` (Speech-to-Text)
  - Google Translate `client=gtx` (Translation)
  - `speechSynthesis` (Text-to-Speech)

## License

MIT

## Repository

[https://github.com/inchinet/translator](https://github.com/inchinet/translator)

