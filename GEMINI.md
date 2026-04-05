# GEMINI.md

This file defines the project structure and development principles for MyLink. All interactions must follow these guidelines as the primary reference.

## 1. Project Overview
- **Project Name**: MyLink
- **Purpose**: A simple link aggregation service where users share a curated list of links via a unique nickname-based URL.
- **Core Values**: Extreme simplicity, Inline Editing UI, Real-time click statistics.

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Backend/Infrastructure**: Firebase (Authentication - Google Login, Firestore - Database)
- **Utilities**: Lucide React (Icons), Google S2 Favicon API, Web Share API

## 2. Project Structure
- `@src/app`: Next.js App Router pages and layouts.
  - `@[nickname]/page.tsx`: Public visitor profile page (Read-only).
  - `@dashboard/page.tsx`: User link management dashboard (Edit & Statistics).
- `@src/components`: Reusable UI components.
  - `@ui/`: shadcn/ui components.
  - `@inline-edit.tsx`: Inline editing component with ✏️ icon.
- `@src/lib`: Core logic and external service configurations.
  - `@firebase.ts`: Firebase initialization and instances.
  - `@auth.ts`: Google Social Login and user management logic.
- `@docs/`: Planning documents (PRD, User Scenario, Wireframe).

## 3. Core User Scenarios
### Visitor
- **Identification**: Identify creators via nickname and bio.
- **Exploration**: Recognize external platforms via favicons and titles. (Fallback to 🔗 icon if favicon fails).
- **Interaction**: Link clicks open in new tabs and trigger automatic `clickCount` increment.
- **Sharing**: Use [Share] button to spread profile via Web Share API.

### Owner
- **Onboarding**: Easy sign-up via Google Login; `displayName` auto-generated from email prefix.
- **Inline Editing**: Edit nickname, bio, and link info directly on the dashboard without popups.
- **Management**: Real-time favicon preview, link CRUD operations.
- **Analytics**: Monitor popular channels via `clickCount` on the dashboard.

## 4. UI/UX & Layout Principles
- **Dashboard (Admin)**: 6:4 Split Layout.
  - Left (60%): Inline editing area (✏️ icons always visible).
  - Right (40%): Real-time preview within a mobile frame.
- **Landing Page (Public)**: Highly refined text/button-centric UI.
  - No editing elements (✏️ icons) visible.
  - H1 (Nickname) and P (Bio) placed at the top.
- **General**: Responsive design with a Mobile-First approach.

## 5. Database Model (Firestore)
Uses a sub-collection structure for stability and isolation.
- `users` (Collection)
  - `uid` (Document ID)
    - `displayName`: Unique URL slug.
    - `username`: Display name.
    - `bio`: Short bio.
    - `links` (Sub-collection)
      - `title`, `url`, `clickCount`.

## 6. Development Commands
- `npm run dev`: Run development server.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint check.

## 7. Development Conventions
- **Language**: All conversations, documentation (including plans, tasks, and walkthroughs), and code comments MUST be written in Korean (한국어로 작성할 것).
- **Inline First**: All data modifications must prioritize inline editing via `@inline-edit.tsx`.
- **Fallback Handling**: Use Lucide Link icon (🔗) if favicon retrieval fails.
- **Security**: Manage secrets via environment variables; use `NEXT_PUBLIC_` prefix only for client-side keys.
- **Validation**: Verify all changes with build and lint commands.
- **Documentation**: Refer to `@docs/prd.md` for the highest authority on requirements.
