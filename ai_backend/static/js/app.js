(() => {
  const rangeInputs = document.querySelectorAll("input[type='range'][data-live-value]");
  rangeInputs.forEach((input) => {
    const targetId = input.dataset.liveValue;
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const syncValue = () => {
      const val = Number(input.value);
      target.textContent = Number.isFinite(val) ? val.toFixed(2) : input.value;
    };

    input.addEventListener("input", syncValue);
    syncValue();
  });

  const form = document.getElementById("analyze-form");
  if (!form) {
    return;
  }

  const layout = document.getElementById("eval-layout");
  const controlsToggle = document.getElementById("controls-toggle");
  const controlsStorageKey = "consafe-controls-collapsed";

  const applyControlsState = (collapsed) => {
    if (!layout || !controlsToggle) {
      return;
    }

    layout.classList.toggle("controls-collapsed", collapsed);
    controlsToggle.textContent = collapsed ? ">>" : "<<";
    controlsToggle.setAttribute("aria-expanded", String(!collapsed));
    sessionStorage.setItem(controlsStorageKey, collapsed ? "1" : "0");
  };

  if (layout && controlsToggle) {
    applyControlsState(sessionStorage.getItem(controlsStorageKey) === "1");
    controlsToggle.addEventListener("click", () => {
      const collapsed = layout.classList.contains("controls-collapsed");
      applyControlsState(!collapsed);
    });
  }

  form.addEventListener("submit", () => {
    applyControlsState(true);
    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.disabled = true;
      button.textContent = "Processing video...";
    }
  });

  const page = document.querySelector(".page");
  const activeJobId = page ? (page.dataset.activeJobId || "").trim() : "";
  if (!activeJobId) {
    return;
  }

  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const workersBody = document.getElementById("live-workers-body");

  const renderWorkers = (rows) => {
    if (!workersBody) {
      return;
    }

    if (!rows || rows.length === 0) {
      workersBody.innerHTML = "<tr><td colspan='2'>No workers detected in this frame.</td></tr>";
      return;
    }

    workersBody.innerHTML = rows
      .map((row) => {
        const worker = row.Worker || "Unknown";
        const missing = row["Missing in Frame"] || "None";
        return `<tr><td>${worker}</td><td>${missing}</td></tr>`;
      })
      .join("");
  };

  const updateProgress = (data) => {
    if (progressBar) {
      progressBar.style.width = `${data.progress_pct || 0}%`;
    }

    if (progressText) {
      const total = data.total_frames && data.total_frames > 0 ? data.total_frames : "?";
      progressText.textContent = `${data.status}: ${data.frame_index || 0}/${total} frames (${data.progress_pct || 0}%)`;
    }
  };

  const poll = async () => {
    try {
      const response = await fetch(`/status/${activeJobId}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to get live status.");
      }
      const data = await response.json();

      updateProgress(data);
      renderWorkers(data.live_workers || []);

      if (data.status === "completed" && data.result_url) {
        window.location.href = data.result_url;
        return;
      }

      if (data.status === "error") {
        if (progressText) {
          progressText.textContent = `error: ${data.error || "Unknown error"}`;
        }
        return;
      }
    } catch (error) {
      if (progressText) {
        progressText.textContent = "Connection issue while fetching live status... retrying";
      }
    }

    window.setTimeout(poll, 700);
  };

  poll();
})();
