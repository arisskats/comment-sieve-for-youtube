# Chrome Web Store Submission Checklist

## Remaining steps before submission

1. Create final branding assets.
   - Replace the bundled placeholder icon set in `src/assets/icons/` with final brand artwork when ready.
   - Keep the manifest package sizes at 16/32/48/128.
2. Capture real product screenshots from Chrome on YouTube watch pages.
   - Follow `SCREENSHOTS_PLAN.md` exactly so the store gallery is consistent.
3. Decide the publisher contact details.
   - Add a support email to the privacy policy and store listing.
4. Finalize legal copy.
   - Review `PRIVACY.md`.
   - Make sure the Chrome Web Store privacy disclosures match the extension's real behavior.
5. Manually regression test the unpacked build in Chrome.
   - Logged-in YouTube account
   - Logged-out YouTube session
   - Light theme and dark theme
   - Long comment threads with dynamic loading
   - English comments and mixed Greek/Greeklish comments
6. Verify store compliance items.
   - Confirm there is no remote code.
   - Confirm permissions are limited to the declared use case.
   - Confirm the listing does not imply affiliation with YouTube.
7. Package the release build.
   - Run `npm run build`
   - Load `dist/` as unpacked and smoke-test again
   - Zip the final `dist/` contents for submission if needed
8. Complete the Chrome Web Store listing fields.
   - Product title: `Comment Sieve for YouTube`
   - Short description and full description from `STORE_LISTING.md`
   - Category, language, screenshots, privacy disclosures, support contact, and final icon artwork

## Known weak points to review before submission

- The classifier is heuristic and not robust enough to market as high-accuracy moderation.
- No automated test suite currently guards classifier regressions.
- The panel UX works, but it is still closer to an MVP utility overlay than a fully refined product UI.
- The product currently targets desktop YouTube watch pages only, not the broader YouTube surface.
- The bundled icon pack is intentionally a placeholder and should be replaced before public launch if stronger branding is required.
