# Gemini AI Context Initialization File

> **Instructions for the AI:** Initialize context for the 'Divisible By Zero Audio Trainer' (`ws-at`) project based on the details below. Focus on offline React/TypeScript/Capacitor development.

## 🚀 Project Overview
* **Name:** Divisible By Zero Audio Trainer (`ws-at`)
* **Stack:** React, TypeScript, Vite, Capacitor (Android native).
* **Core Philosophy:** 100% offline, zero-data, high-performance audio, zero permissions.
* **App Goal:** Educational ear-training (ABRSM Grades 6-8) using local piano samples.
* **Release Status:** Closed Beta.

## 🎹 Features & Scope
* **Cadences (Grades 6, 7 & 8):** Perfect, Imperfect, Interrupted, Modulations (Major/minor).
* **Easy Mode:** Isolates root-position chords.
* **Sandbox:** Interactive 3-octave keyboard with chord analysis.

## 🛠 Technical Rules
* **Audio Architecture:** Orchestrated via multidimensional MIDI data matrices (`question.progressionMidi`) preceded by a structural reference key-chord (`question.keyChordMidi`). The key-chord must establish tonal context by introducing a mandatory pause of double length (`chordDurationMs * 2`) before the cadence sequence cascades. A mandatory `stopAllAudio()` routine must execute instantly on component exit or context view unmount.
* **Theme Control:** Initialized exactly once at the root layout application layer (`App.tsx`) using the custom `useTheme` hook. It handles global `data-theme` attribute assignments for HTML nodes. Child components read dynamic colors seamlessly via centralized CSS variable properties (`var(--bg-main)`, `var(--text-main)`, etc.) inside `index.css`, avoiding duplicate media queries or hardcoded hex colors (`#ffffff`, `#fff`, `#000000`).
* **Android Native Wrappers:** Configured as portrait-only. Uses `@capacitor/app` to capture native back-button stack step-downs and utilizes `@capacitor/status-bar` to programmatically invert system clock/icon profiles (`Style.Dark` vs `Style.Light`) alongside active workspace state flips. Redundant hardware plugins (`@capacitor/device`) are forbidden—native theme matching must rely on standard browser event queries.
* **UI & Component View Boundaries:** Absolute zero scrolling allowed across primary test screen control loops. Interaction interfaces must use asynchronous status locks (`isPlaying` state tracking) to explicitly disable user click options, buttons, and choice dropdown selectors during live audio thread playback.
* **UX Rule:** Quiz audio must NEVER autoplay on initialization, page refresh, next-question navigation, or Easy Mode toggles. It must strictly wait for user button interaction.

## 🧪 Testing Architecture
* **Framework:** Vitest + TypeScript.
* **Scope:** 100% focused on headless testing of `src/utils/generator.ts` and `buildChordMidi` structural outputs without importing virtual DOM/UI elements.
* **Coverage Scope:** Includes strict validation checks for harmonic sequences (Perfect, Imperfect, Plagal, Interrupted) across large test sample distributions (500+ sweep loops) to guarantee accuracy and ensure Grade 8 advanced mode actively triggers inverted configurations ('b' and 'c' suffix modifiers).
* **Minor Mode Invariants:** Validates that minor keys explicitly enforce a raised leading tone in dominant harmonies, enforcing capital major `V` or `V7` configurations over modal minor variations.

## 🚀 Local Deployment Pipelines
* **Production Build Command:** `npm run prod:build`
* **Execution Chain:** Automated Node versioning hook (`node bump-version.js` to increment build `versionCode` values inside `build.gradle`) ➡️ Vitest Headless Test Suites ➡️ TypeScript Compiler (`tsc -b`) ➡️ Vite Asset Distribution Bundle Build ➡️ Capacitor Sync Code Copying (`npx cap sync android`) ➡️ Native Windows PowerShell Gradle Play Store Bundle Compilation (`.\gradlew.bat bundleRelease`).
* **Safety Gating:** Any broken music theory logic, failing invariant string assertion, or build error will instantly break the script chain execution at the testing stage, completely freezing the native production `.aab` asset creation.

## 📋 Current Status
* **Theme Optimization:** Streamlined `index.css` by extracting duplicate media blocks and mapping `App.tsx`, `CadenceQuiz.tsx`, `ModulationQuiz.tsx`, and `AudioSandbox.tsx` components to universal CSS tokens, enabling instant cross-platform light/dark rendering.
* **Asynchronous Locks:** Configured async-await Promise processing within core playback methods to control UI interaction states during chords/cadence sequencing.
* **Procedural Fixed Gates:** Resolved chord sequence mismatch issues inside the randomizer layout compiler (`generator.ts`), aligning text descriptions directly with target `buildChordMidi` parameters.
