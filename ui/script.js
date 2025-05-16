const sigFiles = [
  { id: "SIG1_BTC.txt", label: "BTC" },
  { id: "SIG2_ETH.txt", label: "ETH" },
  { id: "SIG3_GITHUB.txt", label: "GitHub" },
];

async function checkSigFiles() {
  const results = {};
  for (const sig of sigFiles) {
    try {
      const res = await fetch(sig.id);
      results[sig.id] = res.ok;
    } catch {
      results[sig.id] = false;
    }
  }
  return results;
}

async function loadReport() {
  const output = document.getElementById("report-output");
  const res = await fetch("verify-report.txt");

  if (!res.ok) {
    output.innerText = "❌ Failed to load verify-report.txt";
    return;
  }

  const sigPresence = await checkSigFiles();
  const text = await res.text();
  const lines = text.split("\n");

  let html = `<table><thead><tr><th>File</th><th>Status</th><th>ChM-HASH</th><th>Signatures</th><th>Quorum</th></tr></thead><tbody>`;

  let currentFile = null;
  let currentHash = "";
  let matchStatus = "";

  for (const line of lines) {
    if (line.startsWith("▶ Checking")) {
      currentFile = line.replace("▶ Checking ", "").trim();
      currentHash = "";
      matchStatus = "";
    } else if (line.includes("✅") || line.includes("❌")) {
      matchStatus = line.includes("✅") ? "✅ Match" : "❌ Mismatch";
    } else if (line.startsWith("ChM-HASH:")) {
      currentHash = line.replace("ChM-HASH:", "").trim();

      // Simulate: If a ChM-HASH exists, it could be signed
      const sigList = sigFiles.map(sig => {
        const exists = sigPresence[sig.id];
        return exists ? `✅ ${sig.label}` : `❌ ${sig.label}`;
      });

      const sigCount = sigList.filter(s => s.includes("✅")).length;
      const quorumOK = sigCount >= 2 ? "✅" : "❌";

      html += `<tr>
        <td>${currentFile}</td>
        <td>${matchStatus}</td>
        <td><code>${currentHash}</code></td>
        <td>${sigList.join(", ")}</td>
        <td>${quorumOK} ${sigCount}/3</td>
      </tr>`;
    }
  }

  html += "</tbody></table>";
  output.innerHTML = html;
}

loadReport();
