# 🎲 Ludo Master — Premium Offline PWA

A complete **offline-first** Ludo game built with HTML, CSS & Vanilla JavaScript.  
Works as a **Progressive Web App (PWA)** and can be packaged into an **Android APK**.

![PWA](https://img.shields.io/badge/PWA-Ready-success)
![Offline](https://img.shields.io/badge/Offline-First-blue)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## ✨ Features

- 1–4 Players (Local + AI)
- AI Difficulty: Easy / Medium / Hard
- Animated Dice & Smooth Token Movement
- Smart Move Suggestions
- Voice Announcements (Web Speech API)
- Capture Effects, Confetti, Ranking & Rewards
- Dark / Light Mode
- Fully Offline (Service Worker + Cache)
- Installable on Android / Desktop (PWA)
- Responsive (Mobile, Tablet, Desktop)

---

## 🚀 Quick Start (Local)

```bash
# Just open the file
open index.html

# Or serve it
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080`

---

## 📦 GitHub এ আপলোড করার নিয়ম

### ১. নতুন রিপোজিটরি তৈরি করুন
GitHub-এ গিয়ে **New repository** → নাম দিন `ludo-master` (Public বা Private)

### ২. লোকাল থেকে পুশ করুন

```bash
cd ludo-game
git init
git add .
git commit -m "Initial commit: Ludo Master PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ludo-master.git
git push -u origin main
```

### ৩. GitHub Pages দিয়ে লাইভ করুন (ঐচ্ছিক কিন্তু সুপারিশকৃত)
1. Repository → **Settings** → **Pages**
2. Source: `Deploy from a branch`
3. Branch: `main` / folder: `/ (root)`
4. Save

কিছুক্ষণ পর আপনার গেম লাইভ হবে:
```
https://YOUR_USERNAME.github.io/ludo-master/
```

> **গুরুত্বপূর্ণ**: PWA ও Service Worker সঠিকভাবে কাজ করার জন্য **HTTPS** প্রয়োজন (GitHub Pages এটা দেয়)।

---

## 📱 PWA হিসেবে ইনস্টল (Android / Desktop)

1. গেমটি HTTPS এ হোস্ট করুন (GitHub Pages / Netlify / Vercel)
2. Android Chrome এ খুলুন
3. মেনু (⋮) → **Add to Home screen** / **Install app**
4. হোম স্ক্রিনে আইকন আসবে এবং অ্যাপের মতো চলবে (স্ট্যান্ডঅলোন)

Desktop Chrome/Edge এও Install বাটন দেখা যাবে।

---

## 🤖 Android APK তৈরি করার সবচেয়ে সহজ উপায়

### পদ্ধতি ১: PWABuilder (সবচেয়ে সহজ — সুপারিশকৃত)

1. গেমটি GitHub Pages / যেকোনো HTTPS এ হোস্ট করুন
2. যান → [https://www.pwabuilder.com](https://www.pwabuilder.com)
3. আপনার লাইভ URL দিন (যেমন `https://yourusername.github.io/ludo-master/`)
4. **Start** → PWA স্কোর চেক করবে
5. **Package for stores** → **Android** বেছে নিন
6. Options:
   - Package ID: `com.yourname.ludomaster`
   - App name: `Ludo Master`
   - Theme color: `#7c3aed`
7. **Download** → APK / AAB ফাইল পাবেন

এই APK সরাসরি Android ডিভাইসে ইনস্টল করা যায় (Unknown sources allow করতে হতে পারে)।

### পদ্ধতি ২: Bubblewrap (Google TWA)

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR_USERNAME.github.io/ludo-master/manifest.json
bubblewrap build
```

APK `./app-release-signed.apk` এ পাবেন।

### পদ্ধতি ৩: Capacitor (অ্যাডভান্সড)

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Ludo Master" com.yourname.ludomaster --web-dir .
npx cap add android
npx cap sync
npx cap open android   # Android Studio তে খুলবে
```

Android Studio থেকে **Build → Build Bundle(s) / APK(s)** করুন।

---

## 📁 Project Structure

```
ludo-game/
├── index.html              # Main entry
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker (Offline)
├── css/style.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── board.js
│   ├── ai.js
│   ├── ui.js
│   └── audio.js
├── assets/icons/           # App icons (72 → 512)
├── .gitignore
└── README.md
```

---

## 🔧 Technical Notes

- **Service Worker** caches all assets → full offline play
- **Manifest** enables "Add to Home Screen" + standalone mode
- Fonts fall back to system fonts when offline
- `localStorage` used for profile & settings
- No external game assets required

---

## 📄 License

MIT — আপনি ফ্রি ব্যবহার, মডিফাই ও ডিস্ট্রিবিউট করতে পারবেন।

---

**Made for offline fun.** 🎲  
GitHub-এ পুশ করে PWABuilder দিয়ে APK বানিয়ে নিন!
