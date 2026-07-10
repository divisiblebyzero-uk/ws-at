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
- [ ] **Lock Audio Assets Offline:** Verify that all 12 core piano `.mp3` samples are saved locally in `public/audio/piano/` and that `baseUrl: "/audio/piano/"` is configured inside `src/utils/audioPlayer.ts`.
- [ ] **Test Mobile Hardware Latency:** Launch the app on your physical device, tap the button options quickly, and ensure there is no processing delay or clipping distortion through the phone's native speakers.
- [ ] **Verify Harmonic Minor Logic:** Run through a series of minor-key tests to guarantee the dominant chords ($V$ and $V^7$) consistently trigger the **raised 7th leading-note** interval.
- [ ] **Test Audio Safety Disks:** Confirm that exiting a quiz module or hitting the "Back to Menu" button triggers `stopAllAudio()` instantly to prevent stuck background notes.

## 📱 2. Mobile User Interface & Contrast Checks
- [ ] **Android Dark Mode Audit:** Toggle your physical handset into its system-wide **Dark Mode**. Verify that every text node, selection button, and dropdown menu option remains clearly readable with high contrast.
- [ ] **Check Single-Screen Boundaries:** Ensure all primary control buttons, dropdown choices, and validation banners fit comfortably on your mobile screen viewport without requiring scrolling.
- [ ] **Lock Screen Orientation:** Open `android/app/src/main/AndroidManifest.xml` and enforce a fixed portrait layout to prevent sudden interface shifts during practice:
  ```xml
  android:screenOrientation="portrait"
  ```

## 🏷️ 3. Branding, Native Packaging & Cleanup
- [ ] **Verify App Icon Asset Mapping:** Ensure that your custom white grand piano icon asset appears correctly on your phone's desktop launcher sheet and that old blue Capacitor placeholders are fully evicted from all `mipmap-XXXX` directories.
- [ ] **Set Final Display Name:** Check `android/app/src/main/res/values/strings.xml` and ensure the `app_name` string reads elegantly (e.g., `ABRSM G8 Trainer`) instead of a generic project slug.
- [ ] **Purge Template Cruft:** Confirm that unused default files like `src/App.css` and the default React logos in `src/assets/` have been removed to keep your compile package as light as possible.

## 🚀 4. Compilation Optimization
- [ ] **Execute Project Clean Task:** Run `.\gradlew.bat clean` in your `android/` directory to clear out compilation file histories before running the final generation pass.
- [ ] **Compile Release Binary:** Swap out your target build task from `assembleDebug` to production parameters to optimize performance:
  ```bash
  .\gradlew.bat assembleRelease
  ```
