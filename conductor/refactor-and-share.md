# Plan: Code Splitting and PDF Sharing Improvement

Refactor the single-file `index.html` into a modular structure and improve the PDF sharing functionality.

## Objective
- Split CSS and JS into separate files for better maintainability.
- Enhance the PDF sharing experience.
- Ensure the application remains functional after refactoring.

## Proposed File Structure
```
/home/carlo/Code/html/SUDS/
├── index.html (Reduced to shell)
├── css/
│   └── style.css
└── js/
    ├── state.js    (Global variables)
    ├── utils.js    (Utility functions)
    ├── ui.js       (Rendering and UI logic)
    ├── pdf-gen.js  (PDF generation and sharing)
    └── app.js      (Entry point and business logic)
```

## Implementation Steps

### 1. Create Directory Structure
- Create `css` and `js` directories.

### 2. Extract CSS
- Move all content from `<style>` in `index.html` to `css/style.css`.
- Update `index.html` to link the new stylesheet.

### 3. Extract JS (Phased)
- **`js/state.js`**: Extract `patient`, `currentSessionId`, `fileHandle`.
- **`js/utils.js`**: Extract `uid4`, `uidAct`, `esc`, `today`, `formatDate`, `toast`.
- **`js/pdf-gen.js`**: 
    - Extract `_pdfResult`, `openVPView`, `closeVPView`, `preparePDF`, `downloadPDF`, `sharePDF`, `generatePDF`, `buildQRPayload`, `b64encode`, `b64decode`.
    - **Improve `sharePDF`**: Add `navigator.canShare` check and include a `text` field in the share object for better compatibility with apps like WhatsApp.
- **`js/ui.js`**: 
    - Extract `activeSession`, `activePunteggi`, `punteggio`, `showView`, `goHome`, `openModal`, `closeModal`, `renderPatient`, `renderActivities`, `renderSessionSelector`, `renderSessionList`, etc.
    - Extract `openProgressiView`, `closeProgressiView`, `renderChart`.
- **`js/app.js`**: 
    - Main entry point logic (`initFromHash`).
    - Event listeners (Keyboard, overlays).
    - Session management (`createSession`, `switchSession`, `lockSession`, `unlockSession`).
    - Save/Load logic (`saveJSON`, `saveToFileHandle`, `exportJSON`, `triggerImport`, `importWithFS`, `onFileImport`, `processImportedJSON`, `migrateV1toV2`).

### 4. Update `index.html`
- Remove inline scripts and styles.
- Add `<script src="...">` tags for all new JS files in the correct order (dependencies).

## PDF Sharing Improvement Details
- Modify `sharePDF` to use `navigator.canShare({ files: [file] })`.
- If `canShare` returns false, provide a fallback message or suggest using "Download".
- Add more metadata (text/title) to the `navigator.share` call.

## Verification
- Test all major functionalities:
    - Creating a new patient.
    - Adding/editing activities.
    - Creating/switching sessions (vissuto to stimato copy).
    - "Voglio Provare" view and PDF generation.
    - "Progressi" view and chart.
    - Saving/Loading JSON (File System API and fallback).
    - PDF sharing on mobile (if possible) or verifying the code logic.
