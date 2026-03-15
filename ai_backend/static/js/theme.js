(function () {
  const STORAGE_KEY = "ui-theme";
  const root = document.documentElement;

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme, persist) {
    const normalized = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", normalized);

    const nextLabel = normalized === "light" ? "Dark Mode" : "Light Mode";
    const activeIcon = normalized === "light" ? "☀" : "🌙";
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const iconNode = btn.querySelector(".theme-icon");
      if (iconNode) {
        iconNode.textContent = activeIcon;
      } else {
        btn.textContent = activeIcon;
      }
      btn.setAttribute("aria-label", "Switch to " + nextLabel);
      btn.setAttribute("title", "Switch to " + nextLabel);
    });

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch (_err) {
        // Ignore storage failures in private browsing environments.
      }
    }

    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: normalized } }));
  }

  function initialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (_err) {
      // Ignore storage failures in private browsing environments.
    }
    return "dark";
  }

  function toggleTheme() {
    const next = currentTheme() === "light" ? "dark" : "light";
    applyTheme(next, true);
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const toggle = target.closest("[data-theme-toggle]");
    if (!toggle) {
      return;
    }
    event.preventDefault();
    toggleTheme();
  });

  applyTheme(initialTheme(), false);
})();
