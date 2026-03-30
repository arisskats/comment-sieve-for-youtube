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

export function classifyComment(rawText, blockedKeywords) {
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
