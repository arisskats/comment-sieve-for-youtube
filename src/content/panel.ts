export function createPanel(filters, handlers) {
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
