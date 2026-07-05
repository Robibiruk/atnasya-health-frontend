# 🌿 Atnasya Health Tracker

> A calm, ad-free companion for cycle-aware wellbeing — meditation, yoga, sleep, mood, journaling, and phase-based self-care in one place.

[Live Demo](https://atnasya-health.netlify.app/) • [Report Bug](#) • [Request Feature](#)

![Atnasya App Screenshot](https://plain-eeur-prod-public.komododecks.com/202607/03/dxuGmjmWIsfAyauaknYl/image.jpg)

![React](https://img.shields.io/badge/React-20232A?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-38BDF8?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-000000?logo=express)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### Core tracking
- 📅 Cycle calendar with phase prediction and phase-aware colors
- 🩸 Menstrual, follicular, fertile, ovulation, luteal, pregnancy, postpartum phases
- 📊 Phase-specific insights and daily guidance
- ❤️ Vitals trends and symptom logging
- 🧠 Mood check-ins and emotional patterns
- 🤝 Partner calendar/support with encrypted messaging

### Self-care library
- 🧘 Guided meditation library with illustration-led sessions
- 🤸 Yoga & stretching routines with step-by-step pose guidance
- 🌙 Sleep stories with YouTube audio embed
- 🌬️ Guided breathing exercises with animated cycles
- 🎧 Soundscapes strip for ambience
- 💡 Daily affirmations
- 📖 Wellness library: nutrition, exercise, myths, and guides

### Personalization
- 🐾 Pet icon selector with custom avatars
- 🎨 Theme palette scoped to Home + BottomNav surfaces
- 🌗 Light/dark mode support
- ⭐ Favicon picker with persistent choice
- 🙈 Anonymous mode toggle
- 🔔 Custom reminders with browser notifications
- ⚙️ Profile and settings management

### AI & privacy
- 🤖 Local floating AI assistant with chat persistence
- 📜 Chat history stored per-user on the backend
- 🔐 Firebase auth + protected API routes
- 🚫 Ad-free, no selling user data
- 📱 Responsive across mobile and desktop
- 🌍 Arabic / English with RTL-aware layout

---

## 🎯 Feature Status

| Feature | Status |
|---------|--------|
| Authentication | ✅ |
| Cycle Calendar | ✅ |
| Phase Insights | ✅ |
| Meditation Library | ✅ |
| Yoga Routines | ✅ |
| Sleep Stories | ✅ |
| Breathing Exercises | ✅ |
| Soundscapes | ✅ |
| Daily Affirmations | ✅ |
| Wellness Library | ✅ |
| Mood Tracking | ✅ |
| Vitals Trends | ✅ |
| Pet Selection | ✅ |
| Palette Theming | ✅ |
| Dark Mode | ✅ |
| Favicon Picker | ✅ |
| Notifications | ✅ |
| Anonymous Mode | ✅ |
| Profile Settings | ✅ |
| Monthly Progress | ✅ |
| AI Chat (persistent) | ✅ |
| AI Chat History | ✅ |
| Smart Recommendations | 🚧 Planned |
| Wearable Integration | 🔮 Future |

---

## 🛠 Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Vite
- React Router
- Framer Motion
- Recharts
- Lucide React icons

### Backend
- Node.js + Express
- MongoDB / Mongoose
- Firebase Admin
- TypeScript
- Zod request validation
- node-cron
- express-rate-limit / helmet / cors / morgan

### Tools
- Git + GitHub
- Netlify frontend hosting
- Render backend hosting

---

## 📂 Project Structure

```text
atnasya-health-frontend/
  src/
    components/
      ai/
      ui/
    pages/
    hooks/
    lib/
    i18n/
    store/
    styles/
    assets/
  public/

atnasya-health-backend/
  src/
    index.ts
    types.ts
    firebaseAdmin.ts
    middleware/
    models/
    routes/
    services/
    tests/
```

---

## 🔒 Cybersecurity & Privacy Notes

This app is built around privacy-by-design. A few hard rules:

- **Secrets never go in the repo.**
  - `.env` files are ignored by Git.
  - `.env.example` is intentionally incomplete.
  - If you ever find an API key, password, or service credential in git history, treat it as compromised and rotate it immediately.

- **Client-side secrets stay client-side only.**
  - The frontend uses Firebase client config for authentication and session handling.
  - No backend service-account keys or admin credentials are shipped to the browser.
  - Firebase client config is public-facing by design; it does not grant server/administrative access.

- **Sensitive data is server-scoped and route-protected.**
  - Protected API routes use Firebase ID-token verification.
  - Unauthenticated requests to `/api/cycles`, `/api/ai/*`, partner, and other protected routes return `401 Unauthorized`.
  - Chat history and insights are keyed to `userId` and scoped by route rules.

- **AI handling is strict by provider.**
  - AI providers are separated; cross-provider key/URL substitution is explicitly prevented.
  - Gemini uses only `GEMINI_API_KEY` and `GEMINI_BASE_URL`.
  - OpenRouter is only used after Gemini fails for the same request.
  - No secrets are echoed in frontend error pages or production logs.

- **Transport and origin handling.**
  - Backend CORS in production is locked to the real deployed frontend origin.
  - In development, localhost variants are accepted; production logs use noisy middleware but do not leak request bodies or auth payloads beyond structured error reporting.
  - Helmet and rate-limiting are enabled at the platform layer.

- **Data hygiene.**
  - No ads, no analytics SDKs that sell data, no marketing trackers embedded in the app.
  - Chat/messages are scoped to `ai`, `partner`, and `secret` contexts to keep app semantics clear and auditable.
  - Health data is stored per-user; deletion/reset actions clear personal data under that user identity where implemented.

---

## ⚡ Getting Started

```bash
# Install dependencies
npm install

# Dev
npm run dev

# Build
npm run build
```

### Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

> Do not put backend secrets in frontend `.env`. Frontend environment variables are prefixed with `VITE_` and are exposed to the browser.

---

## 🚀 Recent Changes

- Floating AI launcher moved to the left side
- AI chat now persists messages in backend history
- AI chat history view available from the launcher
- Consultant mode removed; history replaces it
- Zod validation added for AI history route
- CORS expanded for dev localhost, locked in production
- Gemini API fallback hardened to prevent cross-provider config leaks

---

## 🗺 Roadmap

- [x] Authentication
- [x] Cycle Tracking
- [x] Meditation Library
- [x] Yoga Sessions
- [x] Sleep Stories
- [x] Breathing Exercises
- [x] Mood & Vitals
- [x] Profile Customization
- [x] AI Chat
- [x] AI Chat History
- [ ] Smart Recommendations
- [ ] Wearable Integration

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

MIT — free forever, no ads, no tracking.

---

## 👨‍💻 Author

**Robel Biruk**

[LinkedIn](https://www.linkedin.com/in/robel-biruk-5923101b5/) • [GitHub](https://github.com/Robibiruk)

---

> Built with care for calmer days and steadier routines.

---

## 💖 Dedication

This project is dedicated to **Atnasya** ❤️
