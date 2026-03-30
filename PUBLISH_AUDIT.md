# Publish Readiness Audit

## Working title

- Proposed names:
  - `Comment Sieve for YouTube`
  - `YouTube Comment Triage`
  - `CleanComments for YouTube`
- Selected working title: `Comment Sieve for YouTube`

## Readiness snapshot

- Strengths:
  - Minimal permission footprint: only `storage` plus YouTube host access.
  - Local-only processing model with no network requests, remote code, analytics, or account handling.
  - Clear, narrow scope: filter and label comments on YouTube watch pages.
  - Build output is simple and reproducible with a dependency-free local bundler.
- Release blockers or weak areas:
  - No extension icons are present yet, which blocks a real Chrome Web Store submission.
  - No screenshot assets or promo art are included yet.
  - No automated tests exist for classifier behavior, DOM integration, or storage state.
  - No manual compatibility matrix is documented across Chrome versions, logged-in/logged-out states, themes, or language variants.
  - The UI is usable but still feels like an MVP panel rather than a polished extension surface.
  - Classifier quality is heuristic-only and will produce false positives and false negatives.

## Product honesty notes

- The extension should be positioned as a lightweight local filtering aid, not as accurate moderation or safety tooling.
- Greeklish detection is a differentiator, but it also increases the chance of misclassification and needs careful wording in the store listing.
- The product currently fits a niche utility audience better than a broad mainstream audience.

## Recommended submission posture

- Submit only after adding store-ready icons and screenshot assets.
- Keep the listing explicit that comment analysis happens locally in the browser.
- Avoid claims such as `AI moderation`, `accurate detection`, or `blocks abuse automatically`.
