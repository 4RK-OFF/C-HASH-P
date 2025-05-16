async function loadReport() {
  const output = document.getElementById("report-output");
  const res = await fetch("verify-report.txt");

  if (!res.ok) {
    output.innerText = "Failed to load verify-report.txt";
    return;
  }

  const text = await res.text();
  const lines = text.split("\n");

  let html = `<table><thead><tr><th>File</th><th>Status</th><th>ChM-HASH</th></tr></thead><tbody>`;
  let currentFile = null;
  let currentHash = "";

  for (const line of lines) {
    if (line.startsWith("▶ Checking")) {
      currentFile = line.replace("▶ Checking ", "").trim();
      currentHash = "";
    } else if (line.includes("✅") || line.includes("❌")) {
      const match = line.includes("matches");
      const missing = line.includes("missing");
      const status = missing ? "❌ Missing" : (match ? "✅ Match" : "❌ Mismatch");
      html += `<tr><td>${currentFile}</td><td>${status}</td><td>${currentHash}</td></tr>`;
    } else if (line.startsWith("ChM-HASH:")) {
      currentHash = line.replace("ChM-HASH:", "").trim();
    }
  }

  html += "</tbody></table>";
  output.innerHTML = html;
}

loadReport();
