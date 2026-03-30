import "./content.css";
import { classifyComment } from "./classifier";
import { DEFAULT_FILTERS, GREEKLISH_MODES } from "./constants";
import { commentIdFor, findCommentElements, getThreadElement, injectStyles, readCommentText, setCommentHidden, upsertBadge } from "./dom";
import { createPanel } from "./panel";
import { loadFilters, saveFilters } from "./storage";

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
