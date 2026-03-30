import { CATEGORY_COLORS } from "./constants";

const BADGE_CLASS = "ytcf-badge";
const HIDDEN_CLASS = "ytcf-hidden";

export function findCommentElements(root = document) {
  return Array.from(
    root.querySelectorAll("ytd-comment-thread-renderer #content-text")
  ).filter((element) => !!element.closest("ytd-comment-thread-renderer"));
}

export function getThreadElement(commentTextElement) {
  return commentTextElement.closest("ytd-comment-thread-renderer");
}

export function readCommentText(commentTextElement) {
  return commentTextElement.innerText.replace(/\s+/g, " ").trim();
}

export function commentIdFor(commentTextElement) {
  const thread = getThreadElement(commentTextElement);
  const existingId = thread?.dataset.ytcfId;
  if (thread && existingId) {
    return existingId;
  }

  const id = crypto.randomUUID();
  if (thread) {
    thread.dataset.ytcfId = id;
  }
  return id;
}

export function upsertBadge(commentTextElement, category) {
  const renderer =
    commentTextElement.closest("#body") ??
    commentTextElement.parentElement ??
    commentTextElement;

  let badge = renderer.querySelector(`.${BADGE_CLASS}`);
  if (!badge) {
    badge = document.createElement("span");
    badge.className = BADGE_CLASS;
    badge.setAttribute("aria-label", "Comment category");
    commentTextElement.insertAdjacentElement("afterend", badge);
  }

  const greeklishFlag = commentTextElement.dataset.ytcfGreeklish;
  badge.textContent = greeklishFlag ? `${category} / ${greeklishFlag}` : category;
  badge.style.setProperty("--ytcf-badge-color", CATEGORY_COLORS[category]);
}

export function setCommentHidden(threadElement, hidden) {
  threadElement.classList.toggle(HIDDEN_CLASS, hidden);
}

export function injectStyles() {
  if (document.getElementById("ytcf-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "ytcf-styles";
  style.textContent = `
    .ytcf-panel,
    .ytcf-panel * {
      box-sizing: border-box;
    }

    .ytcf-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      padding: 1px 7px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--ytcf-badge-color) 12%, white 88%);
      border: 1px solid color-mix(in srgb, var(--ytcf-badge-color) 30%, white);
      color: var(--ytcf-badge-color);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.03em;
      line-height: 1.5;
      text-transform: capitalize;
      white-space: nowrap;
    }

    .ytcf-hidden {
      display: none !important;
    }

    .ytcf-panel {
      position: fixed;
      top: 84px;
      right: 16px;
      z-index: 99999;
      width: min(264px, calc(100vw - 20px));
      max-height: calc(100vh - 96px);
      overflow: auto;
      padding: 10px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.97);
      border: 1px solid rgba(15, 23, 42, 0.08);
      color: #0f172a;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);
      font-family: Roboto, "Segoe UI", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      backdrop-filter: blur(8px);
    }

    .ytcf-panel__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }

    .ytcf-panel__title {
      min-width: 0;
    }

    .ytcf-panel__body {
      display: grid;
      gap: 8px;
    }

    .ytcf-panel--collapsed {
      width: fit-content;
      min-width: 0;
      max-height: none;
    }

    .ytcf-panel--collapsed .ytcf-panel__body {
      display: none;
    }

    .ytcf-eyebrow {
      margin: 0 0 2px;
      color: #64748b;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ytcf-panel h2 {
      margin: 0;
      font-size: 13px;
      line-height: 1.25;
      font-weight: 700;
    }

    .ytcf-panel label,
    .ytcf-panel select,
    .ytcf-panel button,
    .ytcf-panel textarea {
      display: block;
      width: 100%;
      font: inherit;
    }

    .ytcf-section {
      margin: 0;
      padding: 9px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid rgba(148, 163, 184, 0.18);
    }

    .ytcf-section__title {
      display: block;
      margin-bottom: 6px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #334155;
      text-transform: uppercase;
    }

    .ytcf-option {
      display: flex !important;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 6px;
      cursor: pointer;
      color: #0f172a;
      line-height: 1.35;
    }

    .ytcf-option:last-of-type {
      margin-bottom: 0;
    }

    .ytcf-panel input[type="checkbox"] {
      width: auto;
      margin: 1px 0 0;
      accent-color: #ef4444;
    }

    .ytcf-field {
      margin: 0;
    }

    .ytcf-panel textarea,
    .ytcf-panel select {
      padding: 7px 9px;
      resize: vertical;
      border: 1px solid rgba(148, 163, 184, 0.35);
      border-radius: 8px;
      background: #ffffff;
      color: inherit;
      min-width: 0;
    }

    .ytcf-panel textarea {
      min-height: 58px;
      margin: 0;
    }

    .ytcf-panel textarea:focus,
    .ytcf-panel select:focus,
    .ytcf-panel button:focus {
      outline: 2px solid rgba(239, 68, 68, 0.22);
      outline-offset: 1px;
    }

    .ytcf-helper {
      margin: 0;
      color: #64748b;
      font-size: 10px;
      line-height: 1.4;
    }

    .ytcf-helper--dense {
      margin-top: 6px;
    }

    .ytcf-panel .ytcf-actions {
      display: flex;
      gap: 8px;
      margin-top: 2px;
    }

    .ytcf-panel button {
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 7px 9px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
    }

    .ytcf-panel .ytcf-toggle {
      width: auto;
      flex: 0 0 auto;
      padding: 5px 8px;
      background: #ffffff;
      color: #334155;
      border-color: rgba(148, 163, 184, 0.35);
      font-size: 11px;
    }

    .ytcf-panel .ytcf-reset {
      background: #ffffff;
      color: #334155;
      border-color: rgba(148, 163, 184, 0.35);
    }

    .ytcf-panel .ytcf-save {
      background: #ef4444;
      color: #ffffff;
    }

    .ytcf-panel .ytcf-save:hover {
      background: #dc2626;
    }

    .ytcf-panel .ytcf-reset:hover,
    .ytcf-panel .ytcf-toggle:hover {
      background: #f8fafc;
    }

    @media (max-width: 1100px) {
      .ytcf-panel {
        position: static;
        width: auto;
        max-height: none;
        margin: 10px 12px 0;
      }
    }

    @media (max-width: 640px) {
      .ytcf-panel {
        margin: 8px 8px 0;
        width: calc(100vw - 16px);
        padding: 8px;
        border-radius: 12px;
      }

      .ytcf-panel__header {
        gap: 8px;
      }

      .ytcf-panel .ytcf-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .ytcf-panel textarea {
        min-height: 52px;
      }
    }
  `;

  document.head.appendChild(style);
}
