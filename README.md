# Divisible By Zero Audio Trainer

Master ABRSM Grade 7 & 8 aural tests with a professional piano chord simulator.

Accelerate your path to advanced music examination success with the Divisible By Zero Aural Trainer. Designed specifically for students, musicians, and teachers preparing for advanced aural exams, this tool delivers rigorous, procedurally accurate training for ABRSM Grade 7 and Grade 8 aural parameters.

Unlike generic ear-training apps that play simple synth beeps, our app uses a premium grand piano sampler asset bank. It delivers rich, realistic 4-part SATB harmony configurations exactly like a live examiner sitting at a studio upright.

The app runs 100% offline, requires zero special device permissions, and features a zero-data tracking architecture—giving you a fast, distraction-free environment to train your ear anywhere, anytime.

---

🚀 COMPLETE SYLLABUS-ALIGNED MODULES:

• CADENCE PROGRESSIONS (GRADES 7 & 8)
- Grade 7: Master 2-chord root-position progressions. Correctly identify Perfect, Imperfect, and Interrupted models and their underlying Roman numerals (I, IV, V, V7, VI).
- Grade 8: Tackle full 3-chord phrases with advanced inversions. Test your capacity to identify positions including Tonic (Root, b, c), Supertonic (Root, b), Subdominant, Dominant (Root, b, c), Dominant 7th, and Submediant.
- Features an alternative "Easy Mode" for Grade 8 to isolate root-position chords during early study.

• MODULATION TRACKING (GRADES 7 & 8)
- Grade 7: Trace modulations starting from a Major key out to the Dominant, Subdominant, or Relative Minor.
- Grade 8: Train your pitch memory against both Major and minor starting keys as passages transition seamlessly across structural target scales.

• INTERACTIVE AUDIO REFERENCE SANDBOX
- Explore and compare chord qualities at your own pace.
- Select any global scale center (Major or Harmonic Minor).
- Tap independent buttons to analyze individual inversions or entire cadence families.
- Features an integrated 3-octave visual keyboard display that flashes active MIDI keys in real-time, helping you map what you hear directly onto the piano.

---

🔒 PRIVACY & OPEN SOURCE INTEGRITY:
- 100% Offline Practice: No cellular data or Wi-Fi required.
- Zero Data Tracking: We do not collect, monitor, store, or transmit your personal data or telemetry metrics.
- Open Source: Built for the community. The full source code is publicly hosted under the AGPL-3.0 license.

Simplify your practical ear training and build absolute harmonic confidence. Developed by Divisible By Zero.

DISCLAIMER: This application is an independent educational training utility designed to help students prepare for practical music examinations. It is completely unofficial and is not endorsed by, directly affiliated with, or sponsored by the Associated Board of the Royal Schools of Music (ABRSM). All syllabus references, grade terms, and musical test guidelines are utilized strictly for educational, descriptive, and reference purposes.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Todo

# 📋 Pre-Release Checklist (ABRSM Grade 8 Aural Trainer)

Track this list before compiling the final production release for your Android device to ensure stability, proper formatting, and 100% offline reliability.

---

## 🎹 1. Audio Engine & Asset Validation
- [X] **Lock Audio Assets Offline:** Verify that all 12 core piano `.mp3` samples are saved locally in `public/audio/piano/` and that `baseUrl: "/audio/piano/"` is configured inside `src/utils/audioPlayer.ts`.
- [X] **Test Mobile Hardware Latency:** Launch the app on your physical device, tap the button options quickly, and ensure there is no processing delay or clipping distortion through the phone's native speakers.
- [X] **Verify Harmonic Minor Logic:** Run through a series of minor-key tests to guarantee the dominant chords ($V$ and $V^7$) consistently trigger the **raised 7th leading-note** interval.
- [X] **Test Audio Safety Disks:** Confirm that exiting a quiz module or hitting the "Back to Menu" button triggers `stopAllAudio()` instantly to prevent stuck background notes.

## 📱 2. Mobile User Interface & Contrast Checks
- [ ] **Android Dark Mode Audit:** Toggle your physical handset into its system-wide **Dark Mode**. Verify that every text node, selection button, and dropdown menu option remains clearly readable with high contrast.
- [X] **Check Single-Screen Boundaries:** Ensure all primary control buttons, dropdown choices, and validation banners fit comfortably on your mobile screen viewport without requiring scrolling.
- [ ] **Lock Screen Orientation:** Open `android/app/src/main/AndroidManifest.xml` and enforce a fixed portrait layout to prevent sudden interface shifts during practice:
  ```xml
  android:screenOrientation="portrait"
  ```

## 🏷️ 3. Branding, Native Packaging & Cleanup
- [X] **Verify App Icon Asset Mapping:** Ensure that your custom white grand piano icon asset appears correctly on your phone's desktop launcher sheet and that old blue Capacitor placeholders are fully evicted from all `mipmap-XXXX` directories.
- [X] **Set Final Display Name:** Check `android/app/src/main/res/values/strings.xml` and ensure the `app_name` string reads elegantly (e.g., `ABRSM G8 Trainer`) instead of a generic project slug.
- [X] **Purge Template Cruft:** Confirm that unused default files like `src/App.css` and the default React logos in `src/assets/` have been removed to keep your compile package as light as possible.

## 🚀 4. Compilation Optimization
- [X] **Execute Project Clean Task:** Run `.\gradlew.bat clean` in your `android/` directory to clear out compilation file histories before running the final generation pass.
- [X] **Compile Release Binary:** Swap out your target build task from `assembleDebug` to production parameters to optimize performance:
  ```bash
  .\gradlew.bat assembleRelease
  ```
