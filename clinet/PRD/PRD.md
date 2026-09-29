# Product Requirements Document (PRD): ALEX

| | |
|---|---|
| **Document Type** | Product Requirements Document |
| **Product Name** | ALEX |
| **Version** | 1.0 |
| **Status** | Draft |
| **Owner** | Product Team |

---

## 1. Product Overview

### 1.1 Summary
ALEX is a mobile-first educational companion app built for K-12 school students following the **Maharashtra State Board** curriculum. It combines a digital book store, subject-wise study notes, an AI-powered doubt-solving assistant, and a built-in document scanner into a single, student-friendly platform.

### 1.2 App Identity
| Attribute | Detail |
|---|---|
| **App Name** | ALEX |
| **Theme / Design Language** | Green and White — modern, clean, student-friendly |
| **Primary Curriculum** | Maharashtra State Board |
| **Grade Coverage** | Nursery, LKG, UKG, and Standard 1–12 (Science, Commerce, Arts streams for Std 11–12) |

### 1.3 Target Audience
- School students from **Nursery to 12th Standard**.
- Covers **Science, Commerce, and Arts** streams for senior secondary (11th–12th) students.
- Primary focus: students enrolled under the **Maharashtra State Board**.
- Secondary users: parents/guardians who may assist younger students (Nursery–5th) with account setup and navigation.

### 1.4 Tech Stack
| Layer | Technology |
|---|---|
| **App Framework** | React Native with Expo |
| **Asset Management** | App logo and splash screen assets stored in the project root under `/assets` |
| **Authentication** | Clerk Auth (Google Sign-In and iOS/Apple Sign-In) |
| **Navigation** | Expo Router or React Navigation |

---

## 2. Goals & Objectives

### 2.1 Product Goals
1. Provide a single, unified app where Maharashtra State Board students can access textbooks, notes, AI assistance, and scanning tools.
2. Reduce the time students spend switching between multiple apps (PDF readers, scanners, chatbots, note apps) for their study needs.
3. Deliver a simple, distraction-free, visually calming (green & white) interface suitable for users as young as Nursery-level (via parental assistance) up to 12th standard.
4. Personalize content delivery based on the student's selected board and standard.

### 2.2 Success Metrics (Suggested KPIs)
- Onboarding completion rate (% of users who complete carousel + login + standard selection).
- Daily/Monthly Active Users (DAU/MAU) segmented by standard.
- Average number of AI Chat queries per active user per week.
- Number of documents scanned per user per month.
- Book Store engagement: textbook views/downloads per standard.
- Retention rate (Day 1, Day 7, Day 30).

---

## 3. User Flow & Screen Architecture

**Total Screens: 9**

The end-to-end flow is linear for first-time users and hub-based (bottom navigation) for returning users:

```
Splash → Onboarding (Carousel) → Authentication (Clerk)
   → Standard & Board Selection → Home Page (Dashboard)
        ├── AI Chat Page
        ├── PDF Scan App Page
        ├── Notes Page
        └── Settings & Profile Page
```

---

### 3.1 Screen 1 — Splash Screen

**Purpose:** Initial loading screen displayed when the app is launched.

**Details:**
- Displays the ALEX app logo, sourced from the Expo project root `/assets` directory.
- Purely transitional — no user interaction required.
- Automatically navigates to the **Onboarding / Carousel Screen** after a brief loading period (recommended: 1.5–2.5 seconds, or until initial app resources/auth session check completes).

**Functional Requirements:**
- FR1.1: Display static/animated splash image centered on a white or green branded background.
- FR1.2: Check for an existing authenticated Clerk session in the background while splash is visible.
- FR1.3: If a valid session exists, route directly to Home Page after splash (skip Onboarding/Auth). If not, proceed to Onboarding.

---

### 3.2 Screen 2 — Onboarding / Carousel Screen

**Purpose:** Introduce first-time users to the app's core value propositions.

**UI Elements:**
- A horizontally swipeable carousel with **3 cards/slides**, each containing:
  - An illustrative image/icon.
  - A short headline and supporting description text.
- **Slide Themes:**
  1. Book Store — access to Maharashtra State Board textbooks for all classes.
  2. Study Notes — subject-wise notes, formulas, and practical logs.
  3. AI Assistance — instant doubt-solving and explanations.
- Pagination dots/indicators showing current slide position.
- **Get Started** button — disabled/inactive (greyed out) by default; becomes active and clickable only after the user has swiped through all 3 slides.
- Optional "Skip" link (product decision — not mandatory per spec, flagged as an open question below).

**Functional Requirements:**
- FR2.1: Carousel must support swipe gestures (left/right) and optional tap-to-advance via pagination dots.
- FR2.2: "Get Started" button state changes from disabled to enabled only after slide 3 is reached/viewed.
- FR2.3: Tapping "Get Started" navigates the user to the Authentication Screen.
- FR2.4: This screen should only appear for first-time/unauthenticated users (see FR1.3).

---

### 3.3 Screen 3 — Authentication Screen (Clerk Auth)

**Purpose:** Secure sign-up and login portal for all users.

**Features:**
- Authentication powered by **Clerk**.
- Login/Sign-up options:
  - **Google Login** (Google OAuth via Clerk).
  - **iOS Login** (Sign in with Apple, via Clerk).
- Clean branded layout consistent with the green & white theme, displaying the ALEX logo.
- Basic legal touchpoints: links to Terms of Service and Privacy Policy (recommended, not explicitly specified).

**Functional Requirements:**
- FR3.1: Integrate Clerk SDK for React Native/Expo to handle authentication state and session tokens.
- FR3.2: Support Google sign-in flow end-to-end (account creation + login).
- FR3.3: Support Apple/iOS sign-in flow end-to-end (account creation + login), required for App Store compliance if Google sign-in is offered on iOS.
- FR3.4: On successful authentication, check whether the user has already completed Standard & Board Selection:
  - If **not completed** → redirect to Standard & Board Selection Screen.
  - If **already completed** (returning user) → redirect directly to Home Page.
- FR3.5: Handle and display authentication errors gracefully (network failure, cancelled login, account conflicts).

---

### 3.4 Screen 4 — Standard & Board Selection Screen

**Purpose:** Capture the student's academic profile to personalize content.

**Features:**
- **Board Selection:** Maharashtra State Board (initial launch scope; UI should be designed to allow additional boards in future without redesign).
- **Class/Standard Selection**, covering:
  - Pre-primary: Nursery, LKG, UKG
  - Primary/Secondary: Standard 1 through 10
  - Senior Secondary: Standard 11 and 12, with **stream selection**:
    - Science
    - Commerce
    - Arts
- A "Continue" / "Confirm" button to save selections and proceed.

**Functional Requirements:**
- FR4.1: Present board selection as a single-select list/dropdown (Maharashtra State Board pre-selected/only option at launch).
- FR4.2: Present standard selection as a single-select list or grid (Nursery → 12th).
- FR4.3: If Standard 11 or 12 is selected, dynamically display a mandatory stream selector (Science / Commerce / Arts).
- FR4.4: Persist the selection to the user's profile (linked to Clerk user ID) so it's available on future sessions.
- FR4.5: This selection should be editable later from the Settings & Profile Page.
- FR4.6: On confirmation, navigate to the Home Page, with content immediately filtered to the selected standard/board/stream.

---

### 3.5 Screen 5 — Home Page (Main Dashboard)

**Purpose:** Central hub for discovering and accessing all educational resources.

**Content / Features:**
- **Comprehensive Book Store:**
  - Textbooks organized for Nursery, LKG, UKG, and Standards 1–12 (Maharashtra Board), filtered by the student's selected standard/stream by default, with the option to browse other standards.
  - Book listing with cover thumbnail, subject name, and standard tag.
  - Tap-through to a book detail/reader view (PDF viewer).
- **Quick Access Categories:**
  - Algorithms (relevant for higher standards / computer science subjects)
  - Formulas (Math, Physics, Chemistry quick-reference)
  - Practical Notes (lab/practical journals, especially for Science stream)
- Search bar for finding subjects, books, or topics.
- Bottom navigation bar (persistent across Home, AI Chat, PDF Scan, Notes, and Settings) for quick access to the other core sections.

**Functional Requirements:**
- FR5.1: Fetch and display textbook catalog filtered by the user's selected board/standard/stream.
- FR5.2: Allow users to switch/browse content for other standards without changing their saved profile.
- FR5.3: Display quick-access category tiles (Algorithms, Formulas, Practical Notes) that deep-link into the Notes Page filtered accordingly.
- FR5.4: Implement search functionality across books and notes.
- FR5.5: Persistent bottom tab/navigation bar linking to: Home, AI Chat, PDF Scan, Notes, Settings.

---

### 3.6 Screen 6 — AI Chat Page

**Purpose:** Dedicated AI assistant interface for academic support.

**Features:**
- Chat-style interface where students can:
  - Ask subject-related questions.
  - Get doubts solved with step-by-step explanations.
  - Receive instant explanations of concepts, formulas, or textbook content.
- Chat input box with text entry (voice input as a potential future enhancement).
- Conversation history within a session (and ideally persisted across sessions).
- Loading/typing indicator while the AI generates a response.

**Functional Requirements:**
- FR6.1: Provide a chat UI with message bubbles distinguishing user queries from AI responses.
- FR6.2: Integrate with an AI/LLM backend service to process and respond to student queries.
- FR6.3: Optionally contextualize responses using the student's selected standard/board/stream for age-appropriate, curriculum-aligned answers.
- FR6.4: Persist chat history per user (linked to their account) so they can revisit past conversations.
- FR6.5: Include basic content-safety handling appropriate for a school-age audience.
- FR6.6: Support clearing/starting a new chat session.

---

### 3.7 Screen 7 — PDF Scan App Page

**Purpose:** Built-in scanning tool for converting physical documents into digital PDFs.

**Features:**
- Camera-based scanning of physical pages, handwritten notes, or assignments.
- Auto-edge detection and cropping for clean scans (recommended best practice).
- Multi-page scan support to compile several pages into a single PDF.
- Options to save scanned PDFs locally, to the Notes Page, or share externally (email, WhatsApp, etc.).

**Functional Requirements:**
- FR7.1: Request and handle camera permissions.
- FR7.2: Capture images via device camera and apply edge-detection/cropping for a clean "scanned" appearance.
- FR7.3: Allow users to add multiple pages to a single scan session before finalizing.
- FR7.4: Compile captured pages into a single PDF document.
- FR7.5: Allow saving the generated PDF to the Notes Page and/or device storage.
- FR7.6: Provide a native share sheet to export/share the PDF with other apps.
- FR7.7: Allow basic edits post-scan: retake page, reorder pages, delete page, rotate page.

---

### 3.8 Screen 8 — Notes Page

**Purpose:** Centralized space for organizing and reviewing study material.

**Features:**
- View, manage, and organize:
  - Subject-wise study notes.
  - Formulas (linked from Home Page quick-access).
  - Practical logs/notes (linked from Home Page quick-access).
  - Scanned documents saved from the PDF Scan Page.
- Folder/category-based organization (by subject and/or standard).
- Search and filter within notes.

**Functional Requirements:**
- FR8.1: Display notes organized by category (Subject Notes, Formulas, Practical Notes, Scanned Documents).
- FR8.2: Allow creating, renaming, and deleting folders/categories.
- FR8.3: Allow viewing individual notes/PDFs in an in-app reader.
- FR8.4: Support search and filter by subject, standard, or note type.
- FR8.5: Allow deleting or renaming individual notes/documents.
- FR8.6: Sync notes to the user's account so they persist across devices/sessions.

---

### 3.9 Screen 9 — Settings & Profile Page

**Purpose:** Manage user account, preferences, and app configuration.

**Features:**
- **Profile Management:**
  - Update Name.
  - Update Profile Photo.
  - Update/view Email ID.
- **App Configuration:**
  - Theme toggles (e.g., light/dark mode variants of the green & white theme, if supported).
  - Notification preferences (recommended addition).
  - Edit saved Board/Standard/Stream selection (links back to Screen 4 logic).
- **Log Out button:** Positioned prominently at the bottom of the screen.

**Functional Requirements:**
- FR9.1: Allow editing of name and profile photo (with image picker/camera access).
- FR9.2: Display the registered email ID (editability dependent on Clerk account settings/constraints).
- FR9.3: Allow the user to change their Board/Standard/Stream selection at any time, updating Home Page content accordingly.
- FR9.4: Provide theme toggle controls, if multiple themes are supported.
- FR9.5: Prominent, clearly labeled **Log Out** button at the bottom of the screen that terminates the Clerk session and returns the user to the Authentication Screen.
- FR9.6: (Recommended) Account deletion option for compliance with data privacy expectations.

---

## 4. Technical Specifications

### 4.1 Design System
| Element | Specification |
|---|---|
| **Primary Color** | Green (accent/brand color) |
| **Secondary Color** | White (background) |
| **Design Tone** | Modern, clean, student-friendly; minimal clutter; large legible typography suitable for young readers (Nursery–UKG) through senior secondary students |

### 4.2 Navigation
- Managed via **Expo Router** or **React Navigation**.
- Structure:
  - **Stack Navigation** for the onboarding flow: Splash → Onboarding → Authentication → Standard & Board Selection.
  - **Tab/Bottom Navigation** for the core app hub: Home, AI Chat, PDF Scan, Notes, Settings.
- Smooth, animated transitions between all 9 screens.

### 4.3 Assets
- App logo and splash screen assets are stored in the project root under `/assets` (per Expo convention) and referenced directly by the Splash Screen and app configuration (`app.json`/`app.config.js`).

### 4.4 Authentication
- **Provider:** Clerk Auth.
- **Supported Methods:** Google Sign-In, Apple/iOS Sign-In.
- Session state should be checked at app launch (Splash Screen) to enable auto-login for returning users.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | App should load the Splash Screen within 2 seconds; Home Page content (book store, categories) should load within 3 seconds on a standard 4G connection. |
| **Scalability** | Backend/content structure should support future addition of other boards (CBSE, ICSE) beyond Maharashtra State Board without major rework. |
| **Accessibility** | Legible font sizes and high-contrast green/white palette suitable for younger students; support for standard OS accessibility features (screen readers, font scaling). |
| **Data Privacy** | Compliance with applicable data protection norms for handling minors' data (especially relevant given the Nursery–12th audience); parental consent considerations for younger age groups. |
| **Offline Support** | Recommended: allow previously downloaded/viewed textbooks and notes to be accessible offline. |
| **Platform Support** | iOS and Android via React Native/Expo (single codebase). |
| **Security** | Secure token handling via Clerk; encrypted storage for any locally cached sensitive data. |

---

## 6. Open Questions / Assumptions

1. **Skip option on Onboarding:** Should users be allowed to skip the carousel entirely, or must they always swipe through all 3 slides before "Get Started" activates? *(Current assumption: no skip, per literal spec — Get Started only activates after all 3 slides.)*
2. **AI Chat backend:** Which AI/LLM provider will power the AI Chat Page, and will responses be curriculum-restricted to Maharashtra State Board content?
3. **Book Store content sourcing:** Are textbook PDFs officially licensed/sourced from the Maharashtra State Board (Balbharati), and is there a content management backend for uploading/updating books?
4. **Monetization model:** Is ALEX free, freemium, or subscription-based? Not specified in current scope — affects Home Page and Settings design.
5. **Offline access:** Should the Book Store and Notes support offline download and viewing?
6. **Multi-board future scope:** Should the architecture (data model, Standard & Board Selection UI) be built now to accommodate CBSE/ICSE boards in a future release?
7. **Parental controls:** Given the Nursery–UKG audience, should there be a parent/guardian account linkage or content-gating mechanism?

---

## 7. Out of Scope (Current Version)

- Boards other than Maharashtra State Board.
- Payment/subscription functionality (unless clarified as a requirement).
- Web/desktop version of the app (React Native/Expo mobile only, per current tech stack).
- Offline-first architecture (unless confirmed as a requirement — see Open Questions).

---

## 8. Appendix — Screen Summary Table

| # | Screen | Primary Purpose |
|---|---|---|
| 1 | Splash Screen | App launch/loading, session check |
| 2 | Onboarding / Carousel | First-time user feature introduction |
| 3 | Authentication (Clerk) | Login/sign-up via Google or iOS |
| 4 | Standard & Board Selection | Capture academic profile (board, class, stream) |
| 5 | Home Page (Dashboard) | Book store + quick-access categories |
| 6 | AI Chat Page | AI-powered doubt solving |
| 7 | PDF Scan App Page | Scan physical notes/assignments to PDF |
| 8 | Notes Page | Organize and view subject notes, formulas, practicals, scans |
| 9 | Settings & Profile Page | Account management, preferences, log out |