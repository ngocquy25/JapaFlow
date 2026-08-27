# 🌸 JapaFlow (語)
> **Personalized Real-World Japanese Phrasebook, Native Audio & Shadowing PWA**

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-ff4d6d.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/Vanilla-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modern_Glassmorphism-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

🌐 **Live Demo / Web App:** [https://ngocquy25.github.io/JapaFlow/](https://ngocquy25.github.io/JapaFlow/)

---

## 💡 Overview & Motivation

Traditional language learning apps often force learners through rigid, textbook-heavy curriculums filled with unnatural, academic sentences. 

**JapaFlow** was built with a practical philosophy: **learn only the phrases you actually need in real life**, master authentic native Japanese pronunciation (intonation & pitch accent), and build instant speaking reflexes.

---

## ✨ Key Features

### 1. 🎙️ Native Japanese Speech Synthesis (HD Voice Engine)
- **High-Definition Native Audio Stream:** Real native pronunciation with natural pitch accent, intonation, and rhythm.
- **Dynamic Speed Calibration:** 0.75x (slow for beginners), 0.9x, 1.0x (standard natural), and 1.15x (native conversation tempo).
- **System / iOS Safari Voice Fallback:** Seamlessly integrated with Apple Siri & Kyoko voices on iOS devices.

### 2. 🤖 AI Natural Phrase Assistant
- Type any real-life communicative intent in plain language (e.g., *"declining a drinking party because I'm exhausted"* or *"asking for extra ice water"*).
- Instant contextual synthesis with **Ruby Furigana**, **Romaji**, **Casual (Tameguchi)** vs. **Polite (Keigo)** variations, and practical cultural notes.

### 3. 🎙️ Voice Lab (Pronunciation & Intonation Comparison)
- Record your own voice directly via the Web MediaRecorder API.
- Compare your pitch and intonation side-by-side with native audio.

### 4. 🎴 3D Reflex Flashcards & Hands-Free Shadowing Loop
- **Active Recall Flashcards:** 3D card-flip interaction with instant audio playback on reveal.
- **Hands-Free Shadowing Player:** Automatic continuous playback with structured interval pauses (2.5s) for audio immersion while commuting or working out.

### 5. 📱 Progressive Web App (PWA) & iOS Standalone Mode
- Installable directly to iPhone / iPad / Android home screens with zero App Store friction.
- Fullscreen native-app experience with offline-first Service Worker caching.

### 6. 🔒 100% Privacy & Data Ownership
- All phrase data is persisted locally in client storage (IndexedDB / LocalStorage).
- One-click JSON backup export and restore.

---

## 🛠️ Tech Stack & Architecture

- **Core:** Semantic HTML5, Vanilla JavaScript (ES6+ Modules)
- **Styling:** Modern Vanilla CSS (Custom Design Tokens, Tokyo Night & Sakura Light themes, Glassmorphism, Safe Area Insets for iOS)
- **Audio Engine:** Web Speech Synthesis API + HTML5 Audio Engine + Web MediaRecorder API
- **Typography:** Google Fonts (`Zen Maru Gothic`, `Noto Sans JP`, `Plus Jakarta Sans`)
- **PWA Ecosystem:** Web App Manifest + Service Worker Cache API

---

## 🚀 Getting Started

### Local Setup
No build steps or complex dependencies required:

```bash
# Clone the repository
git clone https://github.com/ngocquy25/JapaFlow.git

# Navigate to project directory
cd JapaFlow

# Start any local HTTP server (e.g. Python)
python -m http.server 3000
```
Open `http://localhost:3000` in your browser.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
