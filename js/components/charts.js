const chartPalette = ["#0055ff", "#4b91cf", "#12b981", "#f59e0b", "#ef4444", "#7c3aed", "#06b6d4"];

export function renderDashboardCharts(stats) {
  renderPieChart("locationChart", "Books by location", stats.byLocation);
  renderBarChart("categoryChart", "Books by category", stats.byCategory);
  renderLineChart("timelineChart", "Newly added books", stats.addedOverTime);
}

function renderPieChart(canvasId, label, dataMap) {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);

  new Chart(document.getElementById(canvasId), {
    type: "pie",
    data: {
      labels,
      datasets: [{ label, data: values, backgroundColor: chartPalette }]
    },
    options: baseOptions()
  });
}

function renderBarChart(canvasId, label, dataMap) {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);

  new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        backgroundColor: "#0055ff",
        borderRadius: 8
      }]
    },
    options: {
      ...baseOptions(),
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

function renderLineChart(canvasId, label, dataMap) {
  const labels = Object.keys(dataMap).sort();
  const values = labels.map((month) => dataMap[month]);

  new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderColor: "#0055ff",
        backgroundColor: "rgba(0, 85, 255, 0.12)",
        fill: true,
        tension: 0.36
      }]
    },
    options: {
      ...baseOptions(),
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 850,
      easing: "easeOutQuart"
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, boxHeight: 12 }
      }
    }
  };
}
