import { DEFAULT_FILTERS, GREEKLISH_MODES, STORAGE_KEY } from "./constants";

function getStorageArea() {
  return typeof chrome !== "undefined" && chrome.storage?.local
    ? chrome.storage.local
    : null;
}

export async function loadFilters() {
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

export async function saveFilters(filters) {
  const storage = getStorageArea();
  if (!storage) {
    return;
  }

  await storage.set({ [STORAGE_KEY]: filters });
}
