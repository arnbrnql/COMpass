# COMpass

A mentorship platform built with Angular 20 and Firebase. Connects mentees with mentors through real-time requests and integrated Cal.com scheduling.

## 🌐 Live Demo

**[https://compass-cb7cd.web.app](https://compass-cb7cd.web.app)**

> **⚠️ Work In Progress**
> 
> This project is currently under active development. Many features are incomplete or experimental. The demo uses a live Firebase backend - please be respectful with test data.

## Features

**Implemented:**
- Dual-role support (users can be both mentors and mentees)
- Real-time mentorship requests with status tracking
- Cal.com integration for scheduling
- Role-based dashboards
- Profile discovery with search and filtering
- Firebase authentication with App Check

**Incomplete/Planned:**
- End-to-end testing suite
- Comprehensive unit test coverage
- Push notifications
- Cloud Functions automation
- Advanced search and filtering
- User messaging system
- Rating and review system

## Tech Stack

**Frontend:** Angular 20.3, Tailwind CSS 4, DaisyUI 5, TypeScript 5.9, RxJS 7.8

**Backend:** Firebase (Auth, Firestore, Storage, App Check, Analytics, Performance, Functions, Messaging)

**External:** Cal.com API for scheduling

**Tools:** ESLint 9, Prettier, Karma + Jasmine

## Architecture

Clean architecture with repository pattern:

```
src/app/
├── core/         # Services, guards, configuration
├── data/         # Repository implementations (Firebase, Cal.com)
├── domain/       # Business logic contracts and models
├── features/     # Lazy-loaded features (auth, dashboard, mentors, etc.)
└── shared/       # Reusable components, pipes, utilities
```

**Key patterns:** Repository pattern, domain services, dependency injection, Angular signals, OnPush change detection, lazy loading.

## Getting Started

### Prerequisites

- Node.js 20 LTS+
- npm 10+
- Firebase project with Auth, Firestore, Storage, and App Check enabled

### Installation

```bash
# Clone and install
git clone <repository-url>
cd COMpass
npm install

# Configure environment
cp src/environments/environment.template.ts src/environments/environment.ts
cp src/environments/environment.template.ts src/environments/environment.prod.ts
```

Edit both environment files with your Firebase credentials from [Firebase Console](https://console.firebase.google.com/) and reCAPTCHA Enterprise key from [Google Cloud Console](https://console.cloud.google.com/).

```typescript
export const environment: AppConfig = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
  },
  recaptchaEnterpriseKey: 'your-recaptcha-key'
};
```

### Development

```bash
npm start              # Dev server at http://localhost:4200
npm run build          # Production build
npm test               # Run tests
npm run test:ci        # CI tests (headless, with coverage)
npm run lint           # Run ESLint
```

## Firebase Setup

Deploy security rules and indexes:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

**Security features:**
- Users can read any profile (for discovery)
- Users can only update their own profile
- Participant-based access control for mentorship requests
- Calendar access lock/unlock mechanism

**Indexes support:**
- Mentorship requests by mentor/mentee with time sorting
- Duplicate request checking
- Paginated lists

## Security Notes

- **Never commit** `environment.ts` or `environment.prod.ts`
- These files are gitignored by default
- Only `environment.template.ts` should be committed
- Use environment variable injection for CI/CD

## Contributing

1. Run `npm run lint` before submitting
2. Write tests for new functionality
3. Follow existing architectural patterns
4. Keep comments minimal and meaningful

## License

MIT

---

Built with Angular 20 and Firebase
