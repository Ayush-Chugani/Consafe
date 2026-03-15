(function () {
  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function getCss(name, fallback) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val || fallback;
  }

  function parseData() {
    const node = document.getElementById("admin-data");
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || "{}");
    } catch (_err) {
      return null;
    }
  }

  function createCharts(payload) {
    if (!payload || typeof Chart === "undefined") {
      return;
    }

    const textColor = getCss("--t2", "#94a3b8");
    const gridColor = getCss("--b1", "rgba(148, 163, 184, 0.2)");
    const cyan = getCss("--c1", "#00d4ff");
    const violet = getCss("--c2-bright", "#a855f7");
    const green = getCss("--c3", "#00ff88");
    const amber = getCss("--c4", "#f59e0b");
    const red = getCss("--c5", "#ff3366");

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    const attendanceTrend = payload.attendance_trend || {};
    const sourceDistribution = payload.source_distribution || {};
    const classCounts = payload.class_counts || {};
    const risk = payload.risk_distribution || {};

    const attendanceCanvas = document.getElementById("attendanceTrendChart");
    if (attendanceCanvas) {
      new Chart(attendanceCanvas, {
        type: "line",
        data: {
          labels: safeArray(attendanceTrend.labels),
          datasets: [{
            label: "Attendance Events",
            data: safeArray(attendanceTrend.values),
            borderColor: cyan,
            backgroundColor: "rgba(0, 212, 255, 0.15)",
            fill: true,
            tension: 0.35,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { maxRotation: 0 } },
            y: { beginAtZero: true },
          },
        },
      });
    }

    const sourceCanvas = document.getElementById("sourceDistributionChart");
    if (sourceCanvas) {
      new Chart(sourceCanvas, {
        type: "doughnut",
        data: {
          labels: safeArray(sourceDistribution.labels),
          datasets: [{
            data: safeArray(sourceDistribution.values),
            backgroundColor: [cyan, violet, green, amber, red],
            borderWidth: 1,
            borderColor: gridColor,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      });
    }

    const classCanvas = document.getElementById("classCountChart");
    if (classCanvas) {
      new Chart(classCanvas, {
        type: "bar",
        data: {
          labels: safeArray(classCounts.labels),
          datasets: [{
            label: "Detections",
            data: safeArray(classCounts.values),
            backgroundColor: "rgba(168, 85, 247, 0.4)",
            borderColor: violet,
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { maxRotation: 0, minRotation: 0 } },
            y: { beginAtZero: true },
          },
        },
      });
    }

    const riskCanvas = document.getElementById("riskDistributionChart");
    if (riskCanvas) {
      new Chart(riskCanvas, {
        type: "polarArea",
        data: {
          labels: ["Low", "Medium", "High"],
          datasets: [{
            data: [risk.LOW || 0, risk.MEDIUM || 0, risk.HIGH || 0],
            backgroundColor: ["rgba(0,255,136,0.3)", "rgba(245,158,11,0.3)", "rgba(255,51,102,0.3)"],
            borderColor: [green, amber, red],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      });
    }
  }

  createCharts(parseData());
})();
