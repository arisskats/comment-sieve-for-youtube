(function () {
const __modules = {
"content/classifier": (module, exports, __require) => {

const RULES = {
  spam: [
    { pattern: /\b(?:subscribe|sub back|check out my channel|visit my channel|giveaway|free money|dm me|whatsapp|telegram|viber)\b/i, reason: "promotion pitch", weight: 2 },
    { pattern: /\b(?:crypto|bitcoin|forex|investment|bonus|promo code|discount code|passive income)\b/i, reason: "money bait", weight: 1 },
    { pattern: /\b(?:earn \$?\d+|work from home|click here|guaranteed profit|100% profit)\b/i, reason: "spam promise", weight: 2 },
    { pattern: /https?:\/\//i, reason: "external link", weight: 2 },
    { pattern: /(?:^|\s)@\w{3,}/, reason: "contact handle", weight: 1 }
  ],
  toxic: [
    { pattern: /\b(?:idiot|moron|stupid|dumb|trash|garbage|loser|pathetic|cringe|brainrot|clown|delusional|embarrassing)\b/i, reason: "insult keyword", weight: 1 },
    { pattern: /\b(?:hate you|shut up|worst take|you suck|kill yourself)\b/i, reason: "hostile phrase", weight: 2 },
    { pattern: /\b(?:malaka|vlakas|geleios|skoupidi|xeftila|xazo|karagkioz)\b/i, reason: "greeklish insult", weight: 1 }
  ],
  positive: [
    { pattern: /\b(?:great|awesome|amazing|love this|love it|excellent|fantastic|wonderful|beautiful|helpful|thanks|thank you)\b/i, reason: "positive keyword" },
    { pattern: /\b(?:best video|well done|nice work|very useful|so helpful)\b/i, reason: "positive phrase" },
    { pattern: /\b(?:bravo|teleio|fov[eo]ro|yperoxo|euxarist|agap[ao])\w*\b/i, reason: "greeklish praise" }
  ],
  question: [
    { pattern: /\?/, reason: "question mark" },
    { pattern: /^(?:who|what|when|where|why|how|is|are|does|did|can|should)\b/i, reason: "question opener" },
    { pattern: /^(?:pos|pws|ti|giati|pou|pote|mporei|einai)\b/i, reason: "greeklish question opener" }
  ]
};

const REPEATED_SYMBOLS = /([!?.])\1{3,}/;
const ALL_CAPS_WORD = /\b[A-Z\u0370-\u03FF]{4,}\b/;
const MOSTLY_CAPS = /^[^a-z\u03b1-\u03c9]*[A-Z\u0370-\u03FF]{4,}/;
const GREEK_CHAR_PATTERN = /[\u0370-\u03FF\u1F00-\u1FFF]/g;
const LATIN_CHAR_PATTERN = /[a-z]/g;
const LATIN_WORD_PATTERN = /[a-z]{2,}/g;
const GREEKLISH_MARKER_PATTERN = /(mp|nt|gk|ts|tz|ks|ps|ou|ai|ei|oi)/;

const GREEKLISH_WORDS = new Set([
  "kai", "den", "tha", "na", "gia", "apo", "sto", "stin", "einai", "eimai",
  "re", "ela", "oti", "pou", "pos", "pws", "giati", "otan", "mono", "poli",
  "poly", "kala", "file", "paidi", "tora", "meta", "akoma", "etsi", "opws",
  "mporei", "mipos", "ontws", "nai", "oxi", "autos", "auto", "mou", "sou",
  "sas", "mas", "edo", "kati", "tipota", "panta", "teleio", "bravo"
]);

const ENGLISH_STOPWORDS = new Set([
  "the", "and", "you", "your", "this", "that", "with", "have", "from", "they",
  "them", "what", "when", "where", "video", "channel", "awesome", "thanks",
  "great", "love", "good", "bad", "really", "very", "just", "about", "there"
]);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasRepeatedWords(text) {
  const words = normalize(text)
    .split(/\s+/)
    .filter((word) => word.length > 2);

  if (words.length < 4) {
    return false;
  }

  const uniqueWordCount = new Set(words).size;
  return uniqueWordCount <= Math.ceil(words.length / 2);
}

function countMatches(text, rules) {
  const matchedReasons = [];
  let score = 0;

  for (const rule of rules) {
    if (!rule.pattern.test(text)) {
      continue;
    }

    matchedReasons.push(rule.reason);
    score += rule.weight || 1;
  }

  return {
    score,
    reasons: matchedReasons
  };
}

function analyzeGreeklish(text) {
  const normalized = normalize(text);
  const latinWords = normalized.match(LATIN_WORD_PATTERN) || [];
  const latinChars = (normalized.match(LATIN_CHAR_PATTERN) || []).length;
  const greekChars = (text.match(GREEK_CHAR_PATTERN) || []).length;

  let lexiconHits = 0;
  let markerHits = 0;
  let englishHits = 0;

  for (const word of latinWords) {
    if (GREEKLISH_WORDS.has(word)) {
      lexiconHits += 1;
    }
    if (word.length >= 4 && GREEKLISH_MARKER_PATTERN.test(word)) {
      markerHits += 1;
    }
    if (ENGLISH_STOPWORDS.has(word)) {
      englishHits += 1;
    }
  }

  let score = 0;

  if (latinChars >= 12 && greekChars === 0) {
    score += 1;
  }
  if (greekChars > 0 && latinChars >= 8) {
    score += 1;
  }
  if (lexiconHits >= 2) {
    score += 2;
  }
  if (lexiconHits >= 4) {
    score += 1;
  }
  if (markerHits >= 2) {
    score += 1;
  }
  if (markerHits >= 4) {
    score += 1;
  }
  if (latinWords.length >= 5 && lexiconHits + markerHits >= 3) {
    score += 1;
  }
  if (englishHits >= 3 && lexiconHits === 0) {
    score -= 2;
  }
  if (englishHits >= 4 && lexiconHits <= 1 && markerHits <= 1) {
    score -= 1;
  }

  const looksGreeklish =
    lexiconHits >= 2 ||
    (lexiconHits >= 1 && markerHits >= 2) ||
    (greekChars > 0 && latinChars >= 8 && lexiconHits >= 1);

  return {
    score,
    isModerate: looksGreeklish && score >= 3 && latinWords.length >= 3,
    isHeavy: looksGreeklish && score >= 4 && latinWords.length >= 4
  };
}

function classifyComment(rawText, blockedKeywords) {
  const text = rawText.trim();
  const normalized = normalize(text);
  const greeklish = analyzeGreeklish(text);

  if (!text) {
    return { category: "neutral", reasons: ["empty"], greeklish };
  }

  if (blockedKeywords.some((keyword) => keyword && normalized.includes(normalize(keyword)))) {
    return {
      category: "spam",
      reasons: ["custom blocked keyword"],
      greeklish
    };
  }

  const spamMatches = countMatches(normalized, RULES.spam);
  const toxicMatches = countMatches(normalized, RULES.toxic);
  const positiveMatches = countMatches(normalized, RULES.positive);
  const questionMatches = countMatches(normalized, RULES.question);
  let spamScore = spamMatches.score;
  let toxicScore = toxicMatches.score;
  const reasons = [];

  if (REPEATED_SYMBOLS.test(text)) {
    spamScore += 1;
    reasons.push("repeated punctuation");
  }

  if (hasRepeatedWords(text)) {
    spamScore += 1;
    reasons.push("repeated words");
  }

  if (ALL_CAPS_WORD.test(text) && /!/.test(text)) {
    toxicScore += 1;
    reasons.push("aggressive caps");
  }

  if (MOSTLY_CAPS.test(text) && text.length > 12) {
    toxicScore += 1;
    reasons.push("mostly caps");
  }

  if (spamScore >= 2 || (spamScore >= 1 && /https?:\/\//i.test(text))) {
    return {
      category: "spam",
      reasons: [...spamMatches.reasons, ...reasons].filter(Boolean),
      greeklish
    };
  }

  if (toxicScore >= 2 || (toxicScore >= 1 && /!{2,}/.test(text))) {
    return {
      category: "toxic",
      reasons: [...toxicMatches.reasons, ...reasons].filter(Boolean),
      greeklish
    };
  }

  if (questionMatches.score >= 1) {
    return { category: "question", reasons: questionMatches.reasons, greeklish };
  }

  if (positiveMatches.score >= 1) {
    return { category: "positive", reasons: positiveMatches.reasons, greeklish };
  }

  return { category: "neutral", reasons: ["fallback"], greeklish };
}

exports.classifyComment = classifyComment;

},
"content/constants": (module, exports, __require) => {

const STORAGE_KEY = "yt-comment-filter-settings";

const GREEKLISH_MODES = {
  all: "all",
  preferGreek: "preferGreek",
  hideGreeklishHeavy: "hideGreeklishHeavy"
};

const DEFAULT_FILTERS = {
  hideToxic: false,
  hideSpam: true,
  showQuestionsOnly: false,
  showPositiveOnly: false,
  greeklishMode: GREEKLISH_MODES.all,
  blockedKeywords: []
};

const CATEGORY_COLORS = {
  toxic: "#b42318",
  spam: "#b54708",
  question: "#175cd3",
  positive: "#027a48",
  neutral: "#475467"
};

exports.STORAGE_KEY = STORAGE_KEY;
exports.GREEKLISH_MODES = GREEKLISH_MODES;
exports.DEFAULT_FILTERS = DEFAULT_FILTERS;
exports.CATEGORY_COLORS = CATEGORY_COLORS;

},
"content/dom": (module, exports, __require) => {
const { CATEGORY_COLORS } = __require("content/constants");
const BADGE_CLASS = "ytcf-badge";
const HIDDEN_CLASS = "ytcf-hidden";

function findCommentElements(root = document) {
  return Array.from(
    root.querySelectorAll("ytd-comment-thread-renderer #content-text")
  ).filter((element) => !!element.closest("ytd-comment-thread-renderer"));
}

function getThreadElement(commentTextElement) {
  return commentTextElement.closest("ytd-comment-thread-renderer");
}

function readCommentText(commentTextElement) {
  return commentTextElement.innerText.replace(/\s+/g, " ").trim();
}

function commentIdFor(commentTextElement) {
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

function upsertBadge(commentTextElement, category) {
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

function setCommentHidden(threadElement, hidden) {
  threadElement.classList.toggle(HIDDEN_CLASS, hidden);
}

function injectStyles() {
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

exports.findCommentElements = findCommentElements;
exports.getThreadElement = getThreadElement;
exports.readCommentText = readCommentText;
exports.commentIdFor = commentIdFor;
exports.upsertBadge = upsertBadge;
exports.setCommentHidden = setCommentHidden;
exports.injectStyles = injectStyles;

},
"content/panel": (module, exports, __require) => {

function createPanel(filters, handlers) {
  const panel = document.createElement("aside");
  panel.className = "ytcf-panel";
  panel.innerHTML = `
    <div class="ytcf-panel__header">
      <div class="ytcf-panel__title">
        <p class="ytcf-eyebrow">Local comment filtering</p>
        <h2>Comment Sieve for YouTube</h2>
        <p class="ytcf-helper">Local heuristics only</p>
      </div>
      <button
        type="button"
        class="ytcf-toggle"
        aria-expanded="true"
        aria-label="Collapse Comment Sieve panel"
      >
        Hide
      </button>
    </div>

    <div class="ytcf-panel__body">
      <section class="ytcf-section">
        <p class="ytcf-section__title">Visibility</p>
        <label class="ytcf-option"><input type="checkbox" data-key="hideSpam">Hide spam by default</label>
        <label class="ytcf-option"><input type="checkbox" data-key="hideToxic">Hide toxic comments</label>
        <label class="ytcf-option"><input type="checkbox" data-key="showQuestionsOnly">Show questions only</label>
        <label class="ytcf-option"><input type="checkbox" data-key="showPositiveOnly">Show positive only</label>
      </section>

      <section class="ytcf-section">
        <label class="ytcf-field">
          <span class="ytcf-section__title">Greeklish handling</span>
          <select data-role="greeklishMode">
            <option value="all">All comments</option>
            <option value="preferGreek">Prefer Greek</option>
            <option value="hideGreeklishHeavy">Hide Greeklish-heavy</option>
          </select>
        </label>
        <p class="ytcf-helper ytcf-helper--dense">Prefer Greek hides weaker transliteration too. Hide Greeklish-heavy only removes strong matches.</p>
      </section>

      <section class="ytcf-section">
        <label class="ytcf-field">
          <span class="ytcf-section__title">Blocked keywords</span>
          <textarea data-role="blockedKeywords" placeholder="comma, separated, keywords"></textarea>
        </label>
        <p class="ytcf-helper ytcf-helper--dense">Keywords are matched locally and saved in browser storage.</p>
      </section>

      <div class="ytcf-actions">
        <button type="button" class="ytcf-save">Save keywords</button>
        <button type="button" class="ytcf-reset">Reset</button>
      </div>
    </div>
  `;

  const checkboxKeys = [
    "hideToxic",
    "hideSpam",
    "showQuestionsOnly",
    "showPositiveOnly"
  ];

  for (const key of checkboxKeys) {
    const input = panel.querySelector(`input[data-key="${key}"]`);
    if (!input) {
      continue;
    }
    input.checked = Boolean(filters[key]);
    input.addEventListener("change", () => handlers.onChange({ [key]: input.checked }));
  }

  const textarea = panel.querySelector('textarea[data-role="blockedKeywords"]');
  const greeklishSelect = panel.querySelector('select[data-role="greeklishMode"]');
  if (textarea) {
    textarea.value = filters.blockedKeywords.join(", ");
  }
  if (greeklishSelect) {
    greeklishSelect.value = filters.greeklishMode;
    greeklishSelect.addEventListener("change", () => {
      handlers.onChange({ greeklishMode: greeklishSelect.value });
    });
  }

  const toggle = panel.querySelector(".ytcf-toggle");
  const body = panel.querySelector(".ytcf-panel__body");
  toggle?.addEventListener("click", () => {
    const isCollapsed = panel.classList.toggle("ytcf-panel--collapsed");
    toggle.textContent = isCollapsed ? "Show" : "Hide";
    toggle.setAttribute("aria-expanded", String(!isCollapsed));
    toggle.setAttribute(
      "aria-label",
      `${isCollapsed ? "Expand" : "Collapse"} Comment Sieve panel`
    );
    if (body) {
      body.setAttribute("aria-hidden", String(isCollapsed));
    }
  });

  panel.querySelector(".ytcf-save")?.addEventListener("click", () => {
    const value = textarea?.value ?? "";
    const blockedKeywords = value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    handlers.onChange({ blockedKeywords });
  });

  panel.querySelector(".ytcf-reset")?.addEventListener("click", handlers.onReset);

  document.body.appendChild(panel);

  return {
    update(nextFilters) {
      for (const key of checkboxKeys) {
        const input = panel.querySelector(`input[data-key="${key}"]`);
        if (input) {
          input.checked = Boolean(nextFilters[key]);
        }
      }
      if (textarea) {
        textarea.value = nextFilters.blockedKeywords.join(", ");
      }
      if (greeklishSelect) {
        greeklishSelect.value = nextFilters.greeklishMode;
      }
    }
  };
}

exports.createPanel = createPanel;

},
"content/storage": (module, exports, __require) => {
const { DEFAULT_FILTERS, GREEKLISH_MODES, STORAGE_KEY } = __require("content/constants");
function getStorageArea() {
  return typeof chrome !== "undefined" && chrome.storage?.local
    ? chrome.storage.local
    : null;
}

async function loadFilters() {
  const storage = getStorageArea();
  if (!storage) {
    return { ...DEFAULT_FILTERS };
  }

  const result = await storage.get(STORAGE_KEY);
  const savedFilters = result[STORAGE_KEY] || {};
  const greeklishMode = Object.values(GREEKLISH_MODES).includes(savedFilters.greeklishMode)
    ? savedFilters.greeklishMode
    : DEFAULT_FILTERS.greeklishMode;

  return {
    ...DEFAULT_FILTERS,
    ...savedFilters,
    greeklishMode,
    blockedKeywords: Array.isArray(savedFilters.blockedKeywords)
      ? savedFilters.blockedKeywords
      : DEFAULT_FILTERS.blockedKeywords
  };
}

async function saveFilters(filters) {
  const storage = getStorageArea();
  if (!storage) {
    return;
  }

  await storage.set({ [STORAGE_KEY]: filters });
}

exports.loadFilters = loadFilters;
exports.saveFilters = saveFilters;

},
"content/index": (module, exports, __require) => {
const { classifyComment } = __require("content/classifier");
const { DEFAULT_FILTERS, GREEKLISH_MODES } = __require("content/constants");
const { commentIdFor, findCommentElements, getThreadElement, injectStyles, readCommentText, setCommentHidden, upsertBadge } = __require("content/dom");
const { createPanel } = __require("content/panel");
const { loadFilters, saveFilters } = __require("content/storage");
let filters = { ...DEFAULT_FILTERS };

function shouldHide(classification, state) {
  const { category, greeklish } = classification;

  if (state.hideToxic && category === "toxic") {
    return true;
  }
  if (state.hideSpam && category === "spam") {
    return true;
  }
  if (state.showQuestionsOnly && category !== "question") {
    return true;
  }
  if (state.showPositiveOnly && category !== "positive") {
    return true;
  }
  if (state.greeklishMode === GREEKLISH_MODES.preferGreek && greeklish.isModerate) {
    return true;
  }
  if (state.greeklishMode === GREEKLISH_MODES.hideGreeklishHeavy && greeklish.isHeavy) {
    return true;
  }
  return false;
}

function classifyAndRenderComment(commentElement) {
  const thread = getThreadElement(commentElement);
  if (!thread) {
    return;
  }

  const text = readCommentText(commentElement);
  const id = commentIdFor(commentElement);
  const classification = classifyComment(text, filters.blockedKeywords);
  commentElement.dataset.ytcfGreeklish = classification.greeklish.isHeavy
    ? "greeklish-heavy"
    : classification.greeklish.isModerate
      ? "greeklish"
      : "";

  upsertBadge(commentElement, classification.category);
  setCommentHidden(thread, shouldHide(classification, filters));
}

function reclassifyAll() {
  for (const commentElement of findCommentElements()) {
    classifyAndRenderComment(commentElement);
  }
}

function observeComments() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }

        if (node.matches?.("ytd-comment-thread-renderer")) {
          const commentText = node.querySelector("#content-text");
          if (commentText) {
            classifyAndRenderComment(commentText);
          }
          continue;
        }

        for (const commentText of findCommentElements(node)) {
          classifyAndRenderComment(commentText);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

async function updateFilters(patch) {
  const nextFilters = { ...filters, ...patch };
  if (patch.showQuestionsOnly) {
    nextFilters.showPositiveOnly = false;
  }
  if (patch.showPositiveOnly) {
    nextFilters.showQuestionsOnly = false;
  }
  filters = nextFilters;
  await saveFilters(filters);
  reclassifyAll();
}

async function init() {
  if (!location.pathname.startsWith("/watch")) {
    return;
  }

  injectStyles();
  filters = await loadFilters();

  const panel = createPanel(filters, {
    onChange: (patch) => {
      void updateFilters(patch).then(() => panel.update(filters));
    },
    onReset: () => {
      void updateFilters(DEFAULT_FILTERS).then(() => panel.update(filters));
    }
  });

  reclassifyAll();
  observeComments();
}

void init();



}
};
const __cache = {};
function __require(id) {
  if (__cache[id]) {
    return __cache[id].exports;
  }
  const factory = __modules[id];
  if (!factory) {
    throw new Error("Module not found: " + id);
  }
  const module = { exports: {} };
  __cache[id] = module;
  factory(module, module.exports, __require);
  return module.exports;
}
__require("content/index");
})();