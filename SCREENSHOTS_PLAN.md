# Chrome Web Store Screenshot Plan

Capture screenshots from a real Chrome desktop session with the unpacked `dist/` build loaded. Use YouTube watch pages only. Avoid channel avatars, usernames, or video titles that create trademark, privacy, or profanity risk.

## Capture rules

- Use Chrome on desktop at 1440px-wide or wider so the YouTube layout is stable.
- Prefer light theme unless a specific screenshot needs contrast for the panel; keep the theme consistent across the set.
- Use one watch page with a healthy mix of neutral, spammy, positive, and question comments.
- Keep at least 3 visible comments in frame whenever possible so the filtering effect is obvious.
- Do not annotate inside the screenshot unless the store asset workflow requires it later.
- Crop to the browser content area only; omit bookmarks bar, unrelated tabs, and OS chrome if possible.

## Required screenshot set

1. Panel overview
   - State: Panel expanded with default settings.
   - Must show: Comment Sieve panel, visible comment badges, spam toggle enabled.
   - Framing: Video player top edge can be partially visible, but comments should dominate the frame.

2. Spam filtering result
   - State: Same page before/after hidden spam comments are visible in the filtered view.
   - Must show: A clear gap or reduced list caused by hidden spam, plus badges on remaining comments.
   - Framing: Focus on the comment column so the effect reads instantly at thumbnail size.

3. Question-only mode
   - State: Filter mode adjusted so question comments remain visible.
   - Must show: The active control state and at least two visible question comments.
   - Framing: Include enough of the panel to read the selected mode.

4. Greeklish mode
   - State: `Prefer Greek` or `Hide Greeklish-heavy` enabled on a page with mixed Greek/Greeklish comments.
   - Must show: The Greeklish selector and comment examples affected by that mode.
   - Framing: Keep the selector and affected comments in the same shot.

5. Custom blocked keywords
   - State: Blocked keywords field populated with safe example terms.
   - Must show: Saved keyword chips or field content plus the filtered comments area.
   - Framing: Tight crop around the lower half of the panel and the top of the comment list.

## Optional extras

- Dark-theme variant of the panel if the UI remains legible and visually stronger than the light-theme set.
- A close-up crop of badges in context if the primary gallery does not make the labels readable.

## Final asset checklist

- Export PNG files at Chrome Web Store-supported dimensions.
- Name files in submission order, for example `01-panel-overview.png`, `02-spam-filtering.png`, and so on.
- Recheck every screenshot against the current build so the controls and labels exactly match the shipped UI.
