# Chrome Web Store Listing Draft

## Product name

`Comment Sieve for YouTube`

## Short description

Filter YouTube comments on watch pages using private, local heuristics for spam, toxicity, questions, positive comments, and Greeklish.

## Full description

Comment Sieve for YouTube helps you clean up the comment section on YouTube watch pages without sending your data anywhere.

The extension analyzes visible comments directly in your browser and adds lightweight labels so you can quickly hide spam, reduce toxic replies, focus on questions, or surface more positive conversation. It also includes optional Greeklish-aware filtering modes for users who want to prefer Greek script or hide heavier transliterated comments.

Everything runs locally. There are no remote APIs, no external AI services, no account connection, and no analytics built into the extension.

Current capabilities:

- Hide spam comments by default
- Hide toxic comments on demand
- Show only questions or only positive comments
- Add your own blocked keywords and save them locally
- Use Greeklish filtering modes for mixed-script comment sections
- Work directly inside YouTube watch pages with no separate dashboard

This extension is best for people who want a lightweight comment-cleanup tool and understand that heuristic filtering is imperfect. Some comments may be mislabeled, and nested reply behavior may vary as YouTube changes its interface.

## Key features

- Local-only comment classification in the browser
- Minimal permissions: YouTube pages plus local storage
- On-page control panel for filter settings
- Built-in spam and toxicity heuristics
- Question-only and positive-only viewing modes
- Greeklish-aware filtering options
- Custom blocked keywords stored locally

## Privacy summary

- Processes comment text locally in the browser
- Does not send comment text to external servers
- Does not collect personal data
- Does not use analytics or tracking
- Stores filter preferences and blocked keywords in `chrome.storage.local`

## Suggested screenshots

- YouTube watch page with the panel open and comment labels visible
- Before/after example showing spam comments hidden
- Greeklish mode selector with affected comments visible
- Blocked keywords field populated with a few example terms
- Question-only mode showing a narrowed comment list

## Suggested promotional copy constraints

- Emphasize `local`, `private`, and `lightweight`
- Avoid promising perfect moderation accuracy
- Avoid suggesting affiliation with YouTube or Google
