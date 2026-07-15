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
* **Audio Architecture:** Orchestrated via multidimensional MIDI data matrices (`question.progressionMidi`) preceded by a structural reference key-chord (`question.keyChordMidi`). The key-chord must establish tonal context by introducing a mandatory pause of double length (`chordDurationMs * 2`) before the cadence sequence cascades. A mandatory `stopAllAudio()` routine must execute instantly on component exit.
* **Android Wrapper:** Native portrait-only configuration layout, full high-contrast system dark-mode compliance, custom "ABRSM G8 Trainer" production icon/package mapping namespace.
* **UI & Component View boundaries:** Absolute zero scrolling allowed across primary test screen control loops. Interaction interfaces must utilize asynchronous status locks (`isPlaying` state tracking) to explicitly disable buttons and input dropdown selectors during live audio thread processing playback.
* **UX Rule:** Quiz audio must NEVER autoplay on initialization, page refresh, next-question navigation, or Easy Mode toggles. It must strictly wait for user button interaction.

## 🧪 Testing Architecture
* **Framework:** Vitest + TypeScript.
* **Scope:** 100% focused on headless testing of `src/utils/generator.ts` and `buildChordMidi` structural outputs without importing virtual DOM/UI elements.
* **Coverage Scope:** Includes strict string validation matches for harmonic progressions (Perfect, Imperfect, Plagal, Interrupted) across large test sample distributions.
* **Minor Mode Rule:** Validates that minor keys explicitly enforce a raised leading tone in dominant harmonies, enforcing capital major `V` or `V7` configurations over modal minor options.

## 🚀 Local Deployment Pipelines
* **Production Build Command:** `npm run prod:build`
* **Execution Chain:** Vitest Headless Runs ➡️ TypeScript Compiler ➡️ Vite Compilation ➡️ Capacitor Android Sync ➡️ Native Windows PowerShell Gradle Local Compilation (`.\gradlew.bat assembleRelease`).
* **Safety:** Any broken music theory logic will instantly fail the terminal test run and completely freeze the downstream Android APK creation.

## 📋 Current Status
* **Component Optimization:** Fixed asynchronous UI state mismatch tracking within `CadenceQuiz.tsx` to grey out active selection triggers cleanly.
* **Procedural Fixes:** Resolved a compilation bug inside `generator.ts` where audio tracking array loops misaligned, fixing the `I — I — V` playback error and establishing a robust headless test gate matrix.
