# Comment Sieve for YouTube

A Chrome extension that classifies YouTube desktop comments with deterministic heuristics and lets you filter them in-page without AI or external services.

## Features

- Manifest V3 Chrome extension
- Content script on `youtube.com/watch*`
- Top-level comment scanning with lightweight badge injection
- Deterministic categories: `toxic`, `spam`, `question`, `positive`, `neutral`
- Greeklish handling modes: `All comments`, `Prefer Greek`, `Hide Greeklish-heavy`
- Stronger default spam filtering and locally saved blocked keywords
- Floating filter panel with grouped controls, saved keywords, and reset
- Dynamic comment handling through `MutationObserver`

## Local setup

1. Build the extension:

```bash
npm run build
```

2. Load it in Chrome:
   - Open `chrome://extensions`
   - Enable `Developer mode`
   - Click `Load unpacked`
   - Select this repo's `dist` folder

## Architecture

- `manifest.json`: MV3 extension manifest.
- `scripts/build.mjs`: dependency-free local bundler that emits a single content script for Chrome.
- `src/content/index.ts`: entry point, bootstraps filtering and observation.
- `src/content/classifier.ts`: deterministic comment classification and Greeklish heuristics.
- `src/content/dom.ts`: DOM querying, badge injection, and injected panel styles.
- `src/content/panel.ts`: floating filter panel and control wiring.
- `src/content/storage.ts`: local persistence for filter state and blocked keywords.

## Classification heuristics

- `spam`: promotional keywords, links, contact handles, repeated punctuation, or repetitive wording. Spam hiding is enabled by default.
- `toxic`: insult keywords, hostile phrases, Greeklish insults, and aggressive all-caps patterns.
- `question`: `?` or common question openers.
- `positive`: positive sentiment keywords like "great", "thanks", "bravo", or "teleio".
- `greeklish`: a separate script heuristic based on transliterated Greek vocabulary, Greeklish digraphs, and script mixing. `Prefer Greek` hides moderate matches; `Hide Greeklish-heavy` hides only stronger matches.
- `neutral`: fallback when nothing else matches.

## Limitations

- Heuristics are intentionally simple and will produce false positives and false negatives.
- The extension only targets desktop YouTube watch pages.
- It focuses on top-level comment threads and does not separately classify nested replies.
- Styling is injected directly by the content script and may need tuning if YouTube changes its DOM.

## Notes

- Custom blocked keywords are stored locally in `chrome.storage.local` as comma-separated terms from the filter panel and still override the built-in classifier.
- Rebuilding updates `dist/assets/*`; reload the unpacked extension after each build.
- This repo uses `.ts` source files with a zero-dependency local build script because package installation is blocked in this environment.
