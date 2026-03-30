export const STORAGE_KEY = "yt-comment-filter-settings";

export const GREEKLISH_MODES = {
  all: "all",
  preferGreek: "preferGreek",
  hideGreeklishHeavy: "hideGreeklishHeavy"
};

export const DEFAULT_FILTERS = {
  hideToxic: false,
  hideSpam: true,
  showQuestionsOnly: false,
  showPositiveOnly: false,
  greeklishMode: GREEKLISH_MODES.all,
  blockedKeywords: []
};

export const CATEGORY_COLORS = {
  toxic: "#b42318",
  spam: "#b54708",
  question: "#175cd3",
  positive: "#027a48",
  neutral: "#475467"
};
